import { useState, useEffect } from "react";
import { getOrganizations } from "@/store/Organization/ServiceOrganization";
import { TypeOrganization } from "@/type/Organization/TypeOrganization";
import { useToast } from "@/hook/useToast";

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<TypeOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const response = await getOrganizations();
      if(response.success && response.data) {
        setOrganizations(response.data);
      }else {
        throw new Error(response.message || "Failed to fetch organizations");
      }
    }catch(err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
      toast({
        variant: "destructive",
        description: `Error fetching organizations: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return { organizations, isLoading, error, refetch: fetchOrganizations };
};
