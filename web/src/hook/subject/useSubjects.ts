import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/services/subject/subjectService";
import { SubjectData } from "@/type/subject";
import { useToast } from "@/component/Ui/use-toast";
import { useTranslation } from "react-i18next";

// Keys for React Query
const SUBJECTS_KEY = "subjects";
const SUBJECT_KEY = "subject";

export const useSubjects = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch all subjects with infinite scrolling
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingSubjects,
    error: subjectsError,
    refetch,
  } = useInfiniteQuery({
    queryKey: [SUBJECTS_KEY],
    queryFn: ({ pageParam = 0 }) => getSubjects(pageParam, 10),
    getNextPageParam: (lastPage, allPages) => {
      if(lastPage.hasMore) {
        return allPages.length;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  // Fetch a single subject by UUID
  const useSubject = (uuid?: string) => {
    return useQuery({
      queryKey: [SUBJECT_KEY, uuid],
      queryFn: () => getSubject(uuid!),
      enabled: !!uuid,
    });
  };

  // Create a new subject
  const createSubjectMutation = useMutation({
    mutationFn: (newSubject: SubjectData) => {
      return createSubject(newSubject);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_KEY] });
      toast({
        title: "Success",
        description: t("subject.createSuccess"),
      });
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  // Update an existing subject
  const updateSubjectMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: SubjectData }) =>
      updateSubject(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_KEY] });
      queryClient.invalidateQueries({
        queryKey: [SUBJECT_KEY, variables.uuid],
      });
      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update subject",
        variant: "destructive",
      });
    },
  });

  // Delete a subject
  const deleteSubjectMutation = useMutation({
    mutationFn: (uuid: string) => deleteSubject(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_KEY] });
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete subject",
        variant: "destructive",
      });
    },
  });

  // Get all subjects as a flat array
  const subjects = data?.pages.flatMap((page) => page.data) || [];
  const totalSubjects = data?.pages[0]?.totalElements || 0;

  return {
    subjects,
    totalSubjects,
    isLoadingSubjects,
    subjectsError,
    fetchNextPage,
    hasNextPage,
    refetch,
    useSubject,
    createSubject: createSubjectMutation.mutate,
    updateSubject: updateSubjectMutation.mutate,
    deleteSubject: deleteSubjectMutation.mutate,
    isCreating: createSubjectMutation.isPending,
    isUpdating: updateSubjectMutation.isPending,
    isDeleting: deleteSubjectMutation.isPending,
  };
};
