'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Package,
  Import,
  FileUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TarotInstructionTemplate } from '@/types/tarot-instructions';
import { tarotInterpretationStyles } from '@/types/index';
import { TarotInstructionsService } from '@/services/tarot-instructions-service';

interface TarotInstructionTemplateManagerProps {
  onClose?: () => void;
  onImportComplete?: () => void;
}

export function TarotInstructionTemplateManager({ 
  onClose, 
  onImportComplete 
}: TarotInstructionTemplateManagerProps) {
  const [activeTab, setActiveTab] = useState('import');
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<TarotInstructionTemplate | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [exportMethod, setExportMethod] = useState('');
  const [exportName, setExportName] = useState('');
  const [exportDescription, setExportDescription] = useState('');
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please select a JSON file'
      });
      return;
    }

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setImportData(data);
        toast({
          title: 'File Loaded',
          description: `Template "${data.name}" loaded successfully`
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Invalid JSON',
          description: 'Could not parse the uploaded file'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'Please upload a template file first'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await TarotInstructionsService.importTemplate(
        importData,
        'current-user', // TODO: Get from auth context
        overwriteExisting
      );

      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? 'Import Successful' : 'Import Failed',
        description: result.message
      });

      if (result.success) {
        setImportFile(null);
        setImportData(null);
        onImportComplete?.();
        if (onClose) onClose();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'Failed to import template'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!exportMethod || !exportName) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await TarotInstructionsService.exportTemplate(
        exportMethod,
        exportName,
        exportDescription,
        'current-user' // TODO: Get from auth context
      );

      if (result.success && result.template) {
        // Create and download the file
        const blob = new Blob([JSON.stringify(result.template, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarot-instructions-${exportMethod}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Export Successful',
          description: result.message
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Export Failed',
          description: result.message
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export template'
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleTemplate = {
    name: 'Sample Template',
    description: 'A sample template showing the expected structure',
    interpretationMethod: 'traditional-rws',
    author: 'System',
    version: '1.0',
    cards: [
      {
        cardId: 'major-0',
        interpretationMethod: 'traditional-rws',
        uprightInstruction: 'Sample upright instruction for The Fool',
        reversedInstruction: 'Sample reversed instruction for The Fool',
        keywords: ['new beginnings', 'innocence', 'adventure'],
        isActive: true
      }
    ]
  };

  const isImportValid = importData && 
    importData.name && 
    importData.interpretationMethod && 
    importData.cards && 
    importData.cards.length > 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Template Manager
          </DialogTitle>
          <DialogDescription>
            Import and export tarot card instruction templates
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="sample">Sample</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Import className="h-5 w-5" />
                  Import Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="import-file">Template File (JSON)</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>

                {importData && (
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Template Name</Label>
                          <p className="text-sm text-muted-foreground">{importData.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Interpretation Method</Label>
                          <p className="text-sm text-muted-foreground">{importData.interpretationMethod}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Author</Label>
                          <p className="text-sm text-muted-foreground">{importData.author || 'Unknown'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Cards</Label>
                          <p className="text-sm text-muted-foreground">{importData.cards.length} cards</p>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium">Description</Label>
                          <p className="text-sm text-muted-foreground">{importData.description}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="overwrite"
                            checked={overwriteExisting}
                            onCheckedChange={setOverwriteExisting}
                          />
                          <Label htmlFor="overwrite" className="text-sm">
                            Overwrite existing instructions
                          </Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isImportValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {isImportValid ? 'Valid template' : 'Invalid template format'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={handleImport}
                    disabled={!isImportValid || loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Import Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Export Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="export-method">Interpretation Method</Label>
                  <Select value={exportMethod} onValueChange={setExportMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interpretation method" />
                    </SelectTrigger>
                    <SelectContent>
                      {tarotInterpretationStyles.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="export-name">Template Name</Label>
                  <Input
                    id="export-name"
                    value={exportName}
                    onChange={(e) => setExportName(e.target.value)}
                    placeholder="Enter template name..."
                  />
                </div>

                <div>
                  <Label htmlFor="export-description">Description</Label>
                  <Textarea
                    id="export-description"
                    value={exportDescription}
                    onChange={(e) => setExportDescription(e.target.value)}
                    placeholder="Describe this template..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={handleExport}
                    disabled={!exportMethod || !exportName || loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Download className="mr-2 h-4 w-4" />
                    Export Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sample" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sample Template Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use this structure as a reference for creating your own templates:
                  </p>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(sampleTemplate, null, 2)}
                    </pre>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], {
                          type: 'application/json'
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'sample-template.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Sample
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {onClose && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}