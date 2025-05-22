import React, { useState, useEffect } from "react";
import { useLazyGetTeachersQuery, useLazyGetRoomsQuery, useLazyGetSubjectsQuery } from "@/store/Binding/ApiBinding";
import { useSearchBindingsMutation, useReplaceBindingsMutation } from "@/store/Binding/ApiSearchReplace";
import { useToast } from "@/component/Ui/use-toast";
import { useI18n } from "@/hook/useI18n";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/component/Ui/alert";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from "@/component/Ui/alert-dialog";
import { Button } from "@/component/Ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/component/Ui/card";
import { Checkbox } from "@/component/Ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/component/Ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { ScrollArea } from "@/component/Ui/scroll-area";
import { Loader2, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import ValidationMessage from "./ValidationMessage";

// Field type options
type FieldType = "Teacher" | "Subject" | "Room";
type ReplacementMode = "all" | "single" | "selected";

// Preview item interface
interface PreviewItem {
  uuid: string;
  binding: {
    uuid: string;
    teacher_name?: string;
    subject_name?: string;
    class_name?: string;
    room_name?: string;
    [key: string]: any;
  };
  selected: boolean;
}

// Option item interface
interface OptionItem {
  uuid: string;
  name: string;
  [key: string]: any;
}

const SearchReplaceForm: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  
  // Field type and values
  const [fieldType, setFieldType] = useState<FieldType>("Teacher");
  const [searchValue, setSearchValue] = useState<string>("");
  const [replaceValue, setReplaceValue] = useState<string>("");
  
  // Options for dropdowns
  const [searchOptions, setSearchOptions] = useState<OptionItem[]>([]);
  const [replaceOptions, setReplaceOptions] = useState<OptionItem[]>([]);
  
  // Preview data
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>("form");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [replacementMode, setReplacementMode] = useState<ReplacementMode>("all");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // RTK Query hooks for fetching data
  const [getTeachers, { data: teachersData, isLoading: isLoadingTeachers }] = useLazyGetTeachersQuery();
  const [getSubjects, { data: subjectsData, isLoading: isLoadingSubjects }] = useLazyGetSubjectsQuery();
  const [getRooms, { data: roomsData, isLoading: isLoadingRooms }] = useLazyGetRoomsQuery();
  
  // RTK Query hooks for search and replace operations
  const [searchBindings, { isLoading: isSearching }] = useSearchBindingsMutation();
  const [replaceBindings, { isLoading: isReplacing }] = useReplaceBindingsMutation();
  
  // Load options when field type changes
  useEffect(() => {
    fetchOptionsForFieldType(fieldType);
    
    // Reset form values when field type changes
    setSearchValue("");
    setReplaceValue("");
    setPreviewItems([]);
    setSuccessMessage(null);
    setValidationErrors({});
  }, [fieldType]);
  
  // Fetch options based on selected field type
  const fetchOptionsForFieldType = (type: FieldType) => {
    switch (type) {
      case "Teacher":
        getTeachers({});
        break;
      case "Subject":
        getSubjects({});
        break;
      case "Room":
        getRooms({});
        break;
    }
  };
  
  // Update options arrays when data is loaded
  useEffect(() => {
    if(teachersData && fieldType === "Teacher") {
      const options = teachersData.data.map(teacher => ({
        uuid: teacher.uuid,
        name: `${teacher.firstName} ${teacher.lastName}`
      }));
      setSearchOptions(options);
      setReplaceOptions(options);
    }
  }, [teachersData, fieldType]);
  
  useEffect(() => {
    if(subjectsData && fieldType === "Subject") {
      const options = subjectsData.data.map(subject => ({
        uuid: subject.uuid,
        name: subject.name
      }));
      setSearchOptions(options);
      setReplaceOptions(options);
    }
  }, [subjectsData, fieldType]);
  
  useEffect(() => {
    if(roomsData && fieldType === "Room") {
      const options = roomsData.data.map(room => ({
        uuid: room.uuid,
        name: room.name
      }));
      setSearchOptions(options);
      setReplaceOptions(options);
    }
  }, [roomsData, fieldType]);
  
  // Validate form before previewing or applying changes
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if(!fieldType) {
      errors.fieldType = t("binding.search.errors.noFieldType");
    }
    
    if(!searchValue) {
      errors.searchValue = t("binding.search.errors.noSearchValue");
    }
    
    if(!replaceValue) {
      errors.replaceValue = t("binding.search.errors.noReplaceValue");
    }
    
    if(searchValue === replaceValue) {
      errors.sameValues = t("binding.search.errors.sameValues");
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Preview changes before applying
  const handlePreviewChanges = async () => {
    if(!validateForm()) return;
    
    setIsLoadingPreview(true);
    setSuccessMessage(null);
    
    try {
      // Map fieldType to API format
      const apiFieldType = fieldType.toLowerCase() as "teacher" | "subject" | "room";
      
      // Call the search API
      const response = await searchBindings({
        fieldType: apiFieldType,
        fieldUuid: searchValue
      }).unwrap();
      
      if(response.data.length === 0) {
        toast({
          variant: "default",
          title: t("binding.search.noMatches.title"),
          description: t("binding.search.noMatches.description")
        });
        return;
      }
      
      // Transform API response to preview items
      const previewData = response.data.map(binding => ({
        uuid: `preview-${binding.uuid}`,
        binding,
        selected: false
      }));
      
      setPreviewItems(previewData);
      setActiveTab("preview");
    }catch(error) {
      console.error("Search failed:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("binding.search.errors.previewFailed")
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };
  
  // Apply changes to bindings
  const handleApplyChanges = async () => {
    if(replacementMode === "selected" && previewItems.filter(item => item.selected).length === 0) {
      toast({
        variant: "destructive",
        title: t("binding.search.errors.noSelection"),
        description: t("binding.search.errors.selectItemsToReplace")
      });
      return;
    }
    
    setShowConfirmDialog(true);
  };
  
  // Confirm and execute the replacement
  const confirmReplacement = async () => {
    setIsApplyingChanges(true);
    setShowConfirmDialog(false);
    
    try {
      // Map fieldType to API format
      const apiFieldType = fieldType.toLowerCase() as "teacher" | "subject" | "room";
      
      // For "selected" mode, we need to collect binding UUIDs
      const bindingUuids = replacementMode === "selected" 
        ? previewItems
            .filter(item => item.selected)
            .map(item => item.binding.uuid)
        : undefined;
      
      // Call the replace API
      const response = await replaceBindings({
        fieldType: apiFieldType,
        searchUuid: searchValue,
        replaceUuid: replaceValue,
        mode: replacementMode,
        bindingUuids: bindingUuids
      }).unwrap();
      
      // Show success message
      const count = response.data.count;
      setSuccessMessage(t("binding.search.success.replaced", { count }));
      
      // Reset preview after successful replacement
      setPreviewItems([]);
      setActiveTab("form");
      
      toast({
        title: t("binding.search.success.title"),
        description: t("binding.search.success.replaced", { count }),
      });
    }catch(error) {
      console.error("Replace failed:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("binding.search.errors.replaceFailed")
      });
    } finally {
      setIsApplyingChanges(false);
    }
  };
  
  // Get count of items to be replaced based on mode
  const getReplacementCount = (): number => {
    switch (replacementMode) {
      case "all":
        return previewItems.length;
      case "single":
        return 1;
      case "selected":
        return previewItems.filter(item => item.selected).length;
      default:
        return 0;
    }
  };
  
  // Toggle selection for a preview item
  const toggleItemSelection = (uuid: string) => {
    setPreviewItems(prevItems => 
      prevItems.map(item => 
        item.uuid === uuid ? { ...item, selected: !item.selected } : item
      )
    );
  };
  
  // Select or deselect all preview items
  const toggleSelectAll = (selectAll: boolean) => {
    setPreviewItems(prevItems => 
      prevItems.map(item => ({ ...item, selected: selectAll }))
    );
  };
  
  // Generate dummy preview data
  const generateDummyPreviewData = (): PreviewItem[] => {
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 items
    const result: PreviewItem[] = [];
    
    const getRandomName = (prefix: string) => {
      const names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis"];
      return `${prefix} ${names[Math.floor(Math.random() * names.length)]}`;
    };
    
    for(let i = 0; i < count; i++) {
      const uuid = `dummy-${i}-${Date.now()}`;
      
      // Create a binding based on the field type
      const binding: any = {
        uuid: `binding-${i}-${Date.now()}`,
        teacher_name: getRandomName("Teacher"),
        subject_name: `Subject ${i + 1}`,
        class_name: `Class ${String.fromCharCode(65 + i)}`,
        room_name: `Room ${101 + i}`
      };
      
      // Set the selected field based on the searchValue
      if(fieldType === "Teacher") {
        binding.teacherUuid = searchValue;
        const option = searchOptions.find(o => o.uuid === searchValue);
        binding.teacher_name = option?.name || binding.teacherName;
      } else if(fieldType === "Subject") {
        binding.subjectUuid = searchValue;
        const option = searchOptions.find(o => o.uuid === searchValue);
        binding.subject_name = option?.name || binding.subjectName;
      } else if(fieldType === "Room") {
        binding.roomUuid = searchValue;
        const option = searchOptions.find(o => o.uuid === searchValue);
        binding.room_name = option?.name || binding.roomName;
      }
      
      result.push({
        uuid,
        binding,
        selected: false
      });
    }
    
    return result;
  };
  
  // Get the field name to display based on the field type
  const getFieldNameByType = (type: FieldType): string => {
    switch (type) {
      case "Teacher":
        return "teacherName";
      case "Subject":
        return "subjectName";
      case "Room":
        return "roomName";
      default:
        return "";
    }
  };
  
  // Get the name of a replacement value
  const getReplacementName = (): string => {
    const option = replaceOptions.find(o => o.uuid === replaceValue);
    return option?.name || "";
  };
  
  // Count selected items
  const getSelectedCount = (): number => {
    return previewItems.filter(item => item.selected).length;
  };
  
  // Check if data is loading
  const isOptionsLoading = (): boolean => {
    switch (fieldType) {
      case "Teacher":
        return isLoadingTeachers;
      case "Subject":
        return isLoadingSubjects;
      case "Room":
        return isLoadingRooms;
      default:
        return false;
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("binding.search.title")}</CardTitle>
        <CardDescription>{t("binding.search.description")}</CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-6">
          <TabsTrigger value="form">{t("binding.search.tabs.form")}</TabsTrigger>
          <TabsTrigger value="preview" disabled={previewItems.length === 0}>
            {t("binding.search.tabs.preview")}
          </TabsTrigger>
        </TabsList>
        
        <CardContent>
          {successMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">{t("binding.search.success.title")}</AlertTitle>
              <AlertDescription className="text-green-700">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-4">
              <ValidationMessage errors={validationErrors} variant="prominent" />
            </div>
          )}
          
          <TabsContent value="form" className="mt-0">
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("binding.search.fieldType")}
                  </label>
                  <Select 
                    value={fieldType} 
                    onValueChange={(value) => setFieldType(value as FieldType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("binding.search.selectFieldType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teacher">{t("binding.search.fieldTypes.teacher")}</SelectItem>
                      <SelectItem value="Subject">{t("binding.search.fieldTypes.subject")}</SelectItem>
                      <SelectItem value="Room">{t("binding.search.fieldTypes.room")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("binding.search.search")}
                    </label>
                    <Select 
                      value={searchValue} 
                      onValueChange={setSearchValue}
                      disabled={isOptionsLoading()}
                    >
                      <SelectTrigger>
                        {isOptionsLoading() ? (
                          <span className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("common.loading")}
                          </span>
                        ) : (
                          <SelectValue placeholder={t("binding.search.selectToSearch")} />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-72">
                          {searchOptions.map(option => (
                            <SelectItem key={option.uuid} value={option.uuid}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("binding.search.replace")}
                    </label>
                    <Select 
                      value={replaceValue} 
                      onValueChange={setReplaceValue}
                      disabled={isOptionsLoading()}
                    >
                      <SelectTrigger>
                        {isOptionsLoading() ? (
                          <span className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("common.loading")}
                          </span>
                        ) : (
                          <SelectValue placeholder={t("binding.search.selectToReplace")} />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-72">
                          {replaceOptions.map(option => (
                            <SelectItem key={option.uuid} value={option.uuid}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("binding.search.replacementMode")}
                    </label>
                    <Select 
                      value={replacementMode} 
                      onValueChange={(value) => setReplacementMode(value as ReplacementMode)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("binding.search.selectReplacementMode")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("binding.search.modes.all")}</SelectItem>
                        {/* <SelectItem value="single">{t("binding.search.modes.single")}</SelectItem> */}
                        <SelectItem value="selected">{t("binding.search.modes.selected")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className="mb-4 flex flex-wrap items-center justify-between">
              <div className="mb-2 md:mb-0">
                <h3 className="text-sm font-medium">
                  {t("binding.search.previewTitle")}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {t("binding.search.previewDescription")}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleSelectAll(true)}
                  disabled={replacementMode !== "selected"}
                >
                  {t("binding.search.selectAll")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleSelectAll(false)}
                  disabled={replacementMode !== "selected"}
                >
                  {t("binding.search.deselectAll")}
                </Button>
              </div>
            </div>
            
            {replacementMode === "selected" && (
              <div className="mb-3 text-sm">
                <span className="font-medium">
                  {t("binding.search.selectedCount", { count: getSelectedCount() })}
                </span>
              </div>
            )}
            
            {previewItems.length > 0 ? (
              <div className="border rounded-md">
                <div className="bg-gray-50 p-3 border-b grid grid-cols-12 gap-2 font-medium text-sm">
                  {replacementMode === "selected" && (
                    <div className="col-span-1"></div>
                  )}
                  <div className={`${replacementMode === "selected" ? "col-span-3" : "col-span-3"}`}>
                    {t("binding.form.teacher")}
                  </div>
                  <div className={`${replacementMode === "selected" ? "col-span-2" : "col-span-3"}`}>
                    {t("binding.form.subject")}
                  </div>
                  <div className={`${replacementMode === "selected" ? "col-span-2" : "col-span-3"}`}>
                    {t("binding.form.class")}
                  </div>
                  <div className={`${replacementMode === "selected" ? "col-span-4" : "col-span-3"}`}>
                    {fieldType}
                  </div>
                </div>
                
                <ScrollArea className="max-h-96">
                  {previewItems.map((item, index) => {
                    const fieldName = getFieldNameByType(fieldType);
                    const currentValue = item.binding[fieldName];
                    const replacementValue = getReplacementName();
                    
                    return (
                      <div 
                        key={item.uuid}
                        className={`p-3 border-b last:border-b-0 grid grid-cols-12 gap-2 items-center text-sm
                          ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          ${replacementMode === "single" && index === 0 ? "ring-2 ring-blue-200" : ""}
                        `}
                      >
                        {replacementMode === "selected" && (
                          <div className="col-span-1">
                            <Checkbox 
                              checked={item.selected}
                              onCheckedChange={() => toggleItemSelection(item.uuid)}
                              disabled={replacementMode !== "selected"}
                            />
                          </div>
                        )}
                        
                        <div className={`${replacementMode === "selected" ? "col-span-3" : "col-span-3"} truncate`}>
                          {item.binding.teacherFullName}
                        </div>
                        
                        <div className={`${replacementMode === "selected" ? "col-span-2" : "col-span-3"} truncate`}>
                          {item.binding.subjectName}
                        </div>
                        
                        <div className={`${replacementMode === "selected" ? "col-span-2" : "col-span-3"} truncate`}>
                          {item.binding.className}|| {item.binding.classBandName}
                        </div>
                        
                        <div className={`${replacementMode === "selected" ? "col-span-4" : "col-span-3"}`}>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{currentValue}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="text-green-600 font-medium">{replacementValue}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md bg-gray-50">
                <p className="text-gray-500">
                  {t("binding.search.noPreviewData")}
                </p>
              </div>
            )}
          </TabsContent>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {activeTab === "form" ? (
            <>
              <Button variant="outline" onClick={() => setActiveTab("form")}>
                {t("binding.search.reset")}
              </Button>
              <Button 
                onClick={handlePreviewChanges} 
                disabled={isLoadingPreview || !searchValue || !replaceValue}
              >
                {isLoadingPreview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("binding.search.previewChanges")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setActiveTab("form")}>
                {t("common.back")}
              </Button>
              <Button 
                onClick={handleApplyChanges}
                disabled={isApplyingChanges || previewItems.length === 0}
              >
                {isApplyingChanges && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("binding.search.applyChanges")}
              </Button>
            </>
          )}
        </CardFooter>
      </Tabs>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("binding.search.confirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {replacementMode === "all" && (
                <p>{t("binding.search.confirm.replaceAll", { count: previewItems.length })}</p>
              )}
              {replacementMode === "single" && (
                <p>{t("binding.search.confirm.replaceSingle")}</p>
              )}
              {replacementMode === "selected" && (
                <p>{t("binding.search.confirm.replaceSelected", { count: getSelectedCount() })}</p>
              )}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  {t("binding.search.confirm.warning")}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReplacement}>
              {t("binding.search.confirm.proceed")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SearchReplaceForm;
