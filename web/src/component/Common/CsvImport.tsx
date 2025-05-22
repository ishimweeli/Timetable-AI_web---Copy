import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/component/Ui/button";
import { useI18n } from "@/hook/useI18n";
import { useToast } from "@/hook/useToast";
import { Checkbox } from "@/component/Ui/checkbox";
import { Label } from "@/component/Ui/label";
import { Upload, CheckCircle2, AlertCircle, X, ChevronDown } from "lucide-react";
import { Spinner } from "@/component/Ui/spinner";
import { useDropzone } from "react-dropzone";
 
export interface ImportError {
  rowNumber: number;
  errorMessage: string;
  originalData?: string;
}
 
export interface ImportResult {
  success: boolean;
  data?: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors: ImportError[];
  };
  message?: string;
}
 
interface CsvImportProps {
  onImport: (file: File, options: { skipHeaderRow: boolean, organizationId?: number | null }) => Promise<ImportResult>;
  buttonVariant?: "default" | "outline" | "secondary";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  organizations?: Array<{ id: number, name: string }>;
  selectedOrgId?: number | null;
  organizationId?: number | null;
  isAdmin?: boolean;
  showOrganizationSelection?: boolean;
}
 
const CsvImport: React.FC<CsvImportProps> = ({
  onImport,
  buttonVariant = "outline",
  buttonSize = "sm",
  organizations = [],
  selectedOrgId = null,
  organizationId = null,
  isAdmin = false,
  showOrganizationSelection = true,
}): React.ReactNode => {
  const { t } = useI18n();
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);
 
 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [skipHeaderRow, setSkipHeaderRow] = useState(true);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImportResultDialogOpen, setIsImportResultDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<number | null>(selectedOrgId || organizationId);
  const [dropdownOpen, setDropdownOpen] = useState(false);
 
 
  useEffect(() => {
    if(!isImportDialogOpen) {
      setDropdownOpen(false);
    }
  }, [isImportDialogOpen]);
 
 
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
   
    if(dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [dropdownOpen, dropdownRef]);
 
 
  useEffect(() => {
    if(isImportDialogOpen) {
      const styleEl = document.createElement('style');
      styleEl.id = 'csv-import-fix';
      styleEl.innerHTML = `
        [role="dialog"] {
          pointer-events: auto !important;
          z-index: 9999 !important;
        }
       
        [role="dialog"] * {
          pointer-events: auto !important;
        }
       
        .dropdown-menu {
          z-index: 10000 !important;
          position: absolute;
          pointer-events: auto !important;
        }
       
        .dialog-overlay {
          z-index: 9998 !important;
        }
       
        body > div[id^="radix-"]:last-child {
          z-index: 9999 !important;
        }
      `;
      document.head.appendChild(styleEl);
     
      return () => {
        const el = document.getElementById('csv-import-fix');
        if(el) document.head.removeChild(el);
      };
    }
  }, [isImportDialogOpen]);
 
  const onDrop = (acceptedFiles: File[]) => {
    if(acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
     
 
      if(file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          variant: "destructive",
          description: t("import.invalidFileType"),
        });
        return;
      }
     
      setSelectedFile(file);
      setIsImportDialogOpen(true);
 
      setSelectedOrganization(selectedOrgId || organizationId);
    }
  };
 
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });
 
  const handleImportConfirm = async () => {
    if(!selectedFile) return;
   
    try {
      setIsImporting(true);
     
      const result = await onImport(
        selectedFile,
        {
          skipHeaderRow,
          organizationId: showOrganizationSelection ? selectedOrganization : null
        }
      );
     
      setImportResult(result);
      setIsImportDialogOpen(false);
      setIsImportResultDialogOpen(true);
     
     
      if(result.success) {
        const { successCount, errorCount } = result.data || { successCount: 0, errorCount: 0 };
       
        if(errorCount === 0 && successCount > 0) {
          toast({
            description: t("import.successToast", { count: String(successCount) }),
          });
        } else if(successCount > 0) {
          toast({
            variant: "default",
            description: t("import.partialSuccessToast", {
              success: String(successCount),
              error: String(errorCount),
              total: String(successCount + errorCount)
            }),
          });
        } else if(errorCount > 0) {
          toast({
            variant: "destructive",
            description: t("import.allFailedToast", { count: String(errorCount) }),
          });
        }
      }else {
        toast({
          variant: "destructive",
          description: result.message || t("import.failed"),
        });
      }
    }catch(error: any) {
      console.error(`Import error:`, error);
      toast({
        variant: "destructive",
        description: error.message || t("import.failed"),
      });
    } finally {
      setIsImporting(false);
    }
  };
 
  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
    setSelectedFile(null);
    setDropdownOpen(false);
  };
 
  const handleCloseImportResultDialog = () => {
    setIsImportResultDialogOpen(false);
    setImportResult(null);
  };
 
  const getOrganizationName = (id: number | null) => {
    if(!id) return "";
    const org = organizations.find((org) => org.id === id);
    return org ? org.name : "";
  };
 
  const handleOrganizationChange = (value: number | null) => {
    setSelectedOrganization(value);
    setDropdownOpen(false);
  };
 
 
  const getSelectedText = () => {
    if(!selectedOrganization) {
      return t("import.selectOrganizationPlaceholder");
    }
   
    return getOrganizationName(selectedOrganization);
  };
 
  const renderImportDialog = () => {
    if(!isImportDialogOpen) return null;
   
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50"
        onClick={(e) => {
          if(e.target === e.currentTarget) {
            handleCloseImportDialog();
          }
        }}
      >
        <div
          className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 my-8 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t("import.confirmationTitle")}</h2>
            <button
              className="rounded-full p-1 hover:bg-muted"
              onClick={handleCloseImportDialog}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
         
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("import.confirmationDescription")}
            </p>
           
            {selectedFile && (
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="mr-3 bg-primary/10 p-2 rounded">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}
           
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skipHeader"
                checked={skipHeaderRow}
                onCheckedChange={(checked) => setSkipHeaderRow(!!checked)}
              />
              <Label htmlFor="skipHeader">{t("import.skipHeaderRow")}</Label>
            </div>
           
            {showOrganizationSelection && (
              <div className="space-y-2">
                <Label>{t("import.selectOrganization")}</Label>
               
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <span>{getSelectedText()}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                 
                  {dropdownOpen && (
                    <div className="dropdown-menu absolute left-0 right-0 mt-1 bg-background border rounded-md shadow-md max-h-[200px] overflow-y-auto">
                      {isAdmin && (
                        <div
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                          onClick={() => handleOrganizationChange(null)}
                        >
                          {t("import.noOrganization")}
                        </div>
                      )}
                     
                      {!isAdmin && organizationId && (
                        <div
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                          onClick={() => handleOrganizationChange(organizationId)}
                        >
                          {getOrganizationName(organizationId)} ({t("import.yourOrganization")})
                        </div>
                      )}
                     
                      {organizations.map((org) => (
                        <div
                          key={org.id}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                          onClick={() => handleOrganizationChange(org.id)}
                        >
                          {org.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
           
            {showOrganizationSelection && isAdmin && !selectedOrganization && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md text-sm flex">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-800 dark:text-yellow-500" />
                <p className="text-yellow-800 dark:text-yellow-500">
                  {t("import.noOrganizationWarning")}
                </p>
              </div>
            )}
           
            {!showOrganizationSelection && (
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-md text-sm flex">
                <AlertCircle className="h-4 w-4 mr-2 text-blue-800 dark:text-blue-500" />
                <p className="text-blue-800 dark:text-blue-500">
                  {t("import.systemLevelImport")}
                </p>
              </div>
            )}
          </div>
         
          <div className="p-4 border-t flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseImportDialog} disabled={isImporting}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleImportConfirm} disabled={!selectedFile || isImporting}>
              {isImporting && <Spinner className="h-4 w-4 mr-2" />}
              {t("import.confirmButton")}
            </Button>
          </div>
        </div>
      </div>
    );
  };
 
  const renderResultDialog = () => {
    if(!isImportResultDialogOpen || !importResult) return null;
   
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50"
        onClick={(e) => {
          if(e.target === e.currentTarget) {
            handleCloseImportResultDialog();
          }
        }}
      >
        <div
          className="bg-background rounded-lg shadow-lg w-full max-w-lg mx-4 my-8 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t("import.resultsTitle")}</h2>
            <button
              className="rounded-full p-1 hover:bg-muted"
              onClick={handleCloseImportResultDialog}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
         
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {importResult?.data
                ? t("import.resultsDescription", {
                    total: String(importResult.data.totalProcessed),
                    success: String(importResult.data.successCount),
                    error: String(importResult.data.errorCount)
                  })
                : t("import.resultsDescriptionError")}
            </p>
           
            {importResult?.data && (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">{t("import.totalProcessed")}</p>
                    <p className="text-xl font-semibold">{importResult.data.totalProcessed}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-md text-center">
                    <p className="text-sm text-green-800 dark:text-green-500">{t("import.successful")}</p>
                    <p className="text-xl font-semibold text-green-800 dark:text-green-500">{importResult.data.successCount}</p>
                  </div>
                  <div className={`p-3 rounded-md text-center ${
                    importResult.data.errorCount > 0
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-muted"
                  }`}>
                    <p className={`text-sm ${
                      importResult.data.errorCount > 0
                        ? "text-red-800 dark:text-red-500"
                        : "text-muted-foreground"
                    }`}>{t("import.errors")}</p>
                    <p className={`text-xl font-semibold ${
                      importResult.data.errorCount > 0
                        ? "text-red-800 dark:text-red-500"
                        : "text-muted-foreground"
                    }`}>{importResult.data.errorCount}</p>
                  </div>
                </div>
               
                {/* Error Details */}
                {importResult.data.errorCount > 0 && importResult.data.errors && (
                  <div className="border border-red-200 dark:border-red-800 rounded-md">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 border-b border-red-200 dark:border-red-800">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {t("import.errorDetails")}
                      </h3>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="p-3 space-y-2">
                        {importResult.data.errors.map((error, index) => (
                          <div key={index} className="bg-white dark:bg-background p-3 rounded border border-red-100 dark:border-red-900/50 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">{t("import.row")} {error.rowNumber}</span>
                              <span className="text-muted-foreground text-xs">{error.errorMessage}</span>
                            </div>
                            {error.originalData && (
                              <div className="mt-1 text-xs text-muted-foreground font-mono bg-muted/50 p-1 rounded">
                                {error.originalData}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
               
                {/* Success Message */}
                {importResult.data.successCount > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 dark:text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800 dark:text-green-500 font-medium">
                        {t("import.successMessage", {count: String(importResult.data.successCount)})}
                      </p>
                      <p className="text-xs text-green-700/80 dark:text-green-600/80 mt-1">
                        {t("import.refreshMessage")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
           
            {!importResult?.success && importResult?.message && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 dark:text-red-500 font-medium">
                    {t("import.generalError")}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-600 mt-1">
                    {importResult.message}
                  </p>
                </div>
              </div>
            )}
           
            {/* Special case: No success, no errors in data property, but we have data */}
            {!importResult?.success && importResult?.data && importResult.data.errorCount === 0 && importResult.data.successCount === 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 dark:text-red-500 font-medium">
                    {t("import.noRecordsProcessed")}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-600 mt-1">
                    {t("import.checkFileFormat")}
                  </p>
                </div>
              </div>
            )}
          </div>
         
          <div className="p-4 border-t flex justify-end">
            <Button onClick={handleCloseImportResultDialog}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      </div>
    );
  };
 
  return (
    <>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Button
          variant={buttonVariant}
          size={buttonSize}
        >
          <Upload className="h-4 w-4 mr-2" />
          {t("import.buttonLabel")}
        </Button>
      </div>
     
      {renderImportDialog()}
      {renderResultDialog()}
    </>
  );
};
 
export default CsvImport;