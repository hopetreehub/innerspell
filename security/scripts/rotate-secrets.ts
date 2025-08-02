#!/usr/bin/env ts-node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

interface Secret {
  name: string;
  type: string;
  rotation_days: number;
  last_rotated: string | null;
  description: string;
  sensitivity: 'critical' | 'medium' | 'low';
}

interface SecretsConfig {
  secrets: {
    firebase: {
      client: Secret[];
      server: Secret[];
    };
    application: Secret[];
    email: Secret[];
  };
  rotation_policy: {
    [key: string]: {
      max_days: number;
      warning_days: number;
      alert_days: number;
    };
  };
}

class SecretRotationManager {
  private configPath: string;
  private config: SecretsConfig;
  private dryRun: boolean;

  constructor(configPath: string, dryRun = true) {
    this.configPath = configPath;
    this.config = JSON.parse(readFileSync(configPath, 'utf-8'));
    this.dryRun = dryRun;
  }

  private getDaysSinceRotation(lastRotated: string | null): number {
    if (!lastRotated) return Infinity;
    const rotationDate = new Date(lastRotated);
    const now = new Date();
    return Math.floor((now.getTime() - rotationDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private needsRotation(secret: Secret): boolean {
    const daysSinceRotation = this.getDaysSinceRotation(secret.last_rotated);
    return daysSinceRotation >= secret.rotation_days;
  }

  private getRotationStatus(secret: Secret): 'expired' | 'warning' | 'alert' | 'ok' {
    const daysSinceRotation = this.getDaysSinceRotation(secret.last_rotated);
    const policy = this.config.rotation_policy[secret.sensitivity];
    
    if (daysSinceRotation >= secret.rotation_days) return 'expired';
    if (daysSinceRotation >= secret.rotation_days - policy.alert_days) return 'alert';
    if (daysSinceRotation >= secret.rotation_days - policy.warning_days) return 'warning';
    return 'ok';
  }

  private generateNewSecret(type: string): string {
    switch (type) {
      case 'api_key':
        return `sk_${crypto.randomBytes(32).toString('hex')}`;
      case 'encryption_key':
        return crypto.randomBytes(32).toString('base64');
      case 'credential':
        return crypto.randomBytes(16).toString('hex');
      default:
        throw new Error(`Cannot auto-generate secret of type: ${type}`);
    }
  }

  private updateGitHubSecret(name: string, value: string): void {
    if (this.dryRun) {
      console.log(`[DRY RUN] Would update GitHub secret: ${name}`);
      return;
    }

    try {
      // Using GitHub CLI to set secrets
      execSync(`gh secret set ${name} --body "${value}"`, {
        stdio: 'inherit'
      });
      console.log(`✅ Updated GitHub secret: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to update GitHub secret ${name}:`, error);
      throw error;
    }
  }

  private updateVercelEnv(name: string, value: string): void {
    if (this.dryRun) {
      console.log(`[DRY RUN] Would update Vercel env: ${name}`);
      return;
    }

    try {
      // Using Vercel CLI to set environment variables
      execSync(`vercel env add ${name} production`, {
        input: value,
        stdio: ['pipe', 'inherit', 'inherit']
      });
      console.log(`✅ Updated Vercel env: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to update Vercel env ${name}:`, error);
      throw error;
    }
  }

  private createRotationReport(): string {
    const report: string[] = ['# Secret Rotation Report\n'];
    report.push(`Generated: ${new Date().toISOString()}\n`);
    report.push('## Summary\n');

    let totalSecrets = 0;
    let expiredSecrets = 0;
    let warningSecrets = 0;
    let alertSecrets = 0;

    const checkSecrets = (secrets: Secret[]) => {
      secrets.forEach(secret => {
        totalSecrets++;
        const status = this.getRotationStatus(secret);
        if (status === 'expired') expiredSecrets++;
        else if (status === 'warning') warningSecrets++;
        else if (status === 'alert') alertSecrets++;
      });
    };

    // Check all secret categories
    checkSecrets(this.config.secrets.firebase.client);
    checkSecrets(this.config.secrets.firebase.server);
    checkSecrets(this.config.secrets.application);
    checkSecrets(this.config.secrets.email);

    report.push(`- Total secrets: ${totalSecrets}`);
    report.push(`- Expired: ${expiredSecrets}`);
    report.push(`- Warning: ${warningSecrets}`);
    report.push(`- Alert: ${alertSecrets}`);
    report.push(`- OK: ${totalSecrets - expiredSecrets - warningSecrets - alertSecrets}\n`);

    report.push('## Detailed Status\n');

    const formatSecret = (secret: Secret) => {
      const status = this.getRotationStatus(secret);
      const daysSince = this.getDaysSinceRotation(secret.last_rotated);
      const statusIcon = {
        expired: '🔴',
        alert: '🟠',
        warning: '🟡',
        ok: '🟢'
      }[status];

      return `${statusIcon} **${secret.name}** (${secret.sensitivity})
   - Type: ${secret.type}
   - Last rotated: ${secret.last_rotated || 'Never'}
   - Days since rotation: ${daysSince === Infinity ? 'Never' : daysSince}
   - Rotation required every: ${secret.rotation_days} days
   - Status: ${status.toUpperCase()}\n`;
    };

    report.push('### Firebase Client Secrets\n');
    this.config.secrets.firebase.client.forEach(secret => {
      report.push(formatSecret(secret));
    });

    report.push('### Firebase Server Secrets\n');
    this.config.secrets.firebase.server.forEach(secret => {
      report.push(formatSecret(secret));
    });

    report.push('### Application Secrets\n');
    this.config.secrets.application.forEach(secret => {
      report.push(formatSecret(secret));
    });

    report.push('### Email Secrets\n');
    this.config.secrets.email.forEach(secret => {
      report.push(formatSecret(secret));
    });

    return report.join('\n');
  }

  public async rotateExpiredSecrets(): Promise<void> {
    console.log('🔒 Starting secret rotation check...\n');

    const secretsToRotate: Secret[] = [];
    
    const collectExpiredSecrets = (secrets: Secret[]) => {
      secrets.forEach(secret => {
        if (this.needsRotation(secret)) {
          secretsToRotate.push(secret);
        }
      });
    };

    collectExpiredSecrets(this.config.secrets.firebase.client);
    collectExpiredSecrets(this.config.secrets.firebase.server);
    collectExpiredSecrets(this.config.secrets.application);
    collectExpiredSecrets(this.config.secrets.email);

    if (secretsToRotate.length === 0) {
      console.log('✅ No secrets need rotation at this time.');
      return;
    }

    console.log(`Found ${secretsToRotate.length} secrets that need rotation:\n`);

    for (const secret of secretsToRotate) {
      console.log(`\n🔄 Rotating: ${secret.name}`);
      console.log(`   Type: ${secret.type}`);
      console.log(`   Sensitivity: ${secret.sensitivity}`);
      
      if (['api_key', 'encryption_key', 'credential'].includes(secret.type)) {
        try {
          const newValue = this.generateNewSecret(secret.type);
          
          // Update in GitHub Secrets
          this.updateGitHubSecret(secret.name, newValue);
          
          // Update in Vercel
          if (secret.name.startsWith('NEXT_PUBLIC_')) {
            this.updateVercelEnv(secret.name, newValue);
          }
          
          // Update last rotated date
          if (!this.dryRun) {
            secret.last_rotated = new Date().toISOString();
            this.saveConfig();
          }
          
          console.log(`✅ Successfully rotated ${secret.name}`);
        } catch (error) {
          console.error(`❌ Failed to rotate ${secret.name}:`, error);
        }
      } else {
        console.log(`⚠️  Manual rotation required for ${secret.type} type`);
      }
    }
  }

  public generateReport(): void {
    const report = this.createRotationReport();
    const reportPath = join(process.cwd(), 'security', 'docs', 'rotation-report.md');
    
    if (this.dryRun) {
      console.log('\n[DRY RUN] Would generate report at:', reportPath);
      console.log('\nReport Preview:\n');
      console.log(report);
    } else {
      writeFileSync(reportPath, report);
      console.log(`\n📄 Report generated at: ${reportPath}`);
    }
  }

  private saveConfig(): void {
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  public async checkCompliance(): Promise<boolean> {
    console.log('🔍 Checking secret rotation compliance...\n');
    
    let compliant = true;
    
    const checkSecretCompliance = (secrets: Secret[]) => {
      secrets.forEach(secret => {
        const status = this.getRotationStatus(secret);
        if (status === 'expired') {
          console.log(`❌ EXPIRED: ${secret.name}`);
          compliant = false;
        } else if (status === 'alert') {
          console.log(`🟠 ALERT: ${secret.name} - rotation needed soon`);
        } else if (status === 'warning') {
          console.log(`🟡 WARNING: ${secret.name} - plan rotation`);
        }
      });
    };

    checkSecretCompliance(this.config.secrets.firebase.client);
    checkSecretCompliance(this.config.secrets.firebase.server);
    checkSecretCompliance(this.config.secrets.application);
    checkSecretCompliance(this.config.secrets.email);

    return compliant;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const dryRun = !args.includes('--execute');

  const configPath = join(__dirname, '..', 'configs', 'secrets-config.json');
  const manager = new SecretRotationManager(configPath, dryRun);

  switch (command) {
    case 'rotate':
      manager.rotateExpiredSecrets();
      break;
    case 'report':
      manager.generateReport();
      break;
    case 'check':
      const compliant = manager.checkCompliance();
      process.exit(compliant ? 0 : 1);
      break;
    default:
      console.log(`
Secret Rotation Manager

Usage:
  ts-node rotate-secrets.ts <command> [options]

Commands:
  rotate    Rotate expired secrets
  report    Generate rotation status report
  check     Check compliance status

Options:
  --execute    Actually perform rotations (default is dry-run)

Examples:
  ts-node rotate-secrets.ts check
  ts-node rotate-secrets.ts rotate --execute
  ts-node rotate-secrets.ts report
      `);
  }
}

export { SecretRotationManager };