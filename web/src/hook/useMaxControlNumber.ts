import { useEffect, useState } from "react";
import { useAppSelector } from "./useAppRedux";

export const useMaxControlNumber = (category: string = "DEFAULT") => {
  const [maxControlNumber, setMaxControlNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const orgId = user?.organizationId;
    const token = localStorage.getItem("authToken");
    if (!orgId || !category) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    fetch(`${API_BASE_URL}/api/v1/plan-settings/max-control-number?organizationId=${orgId}&category=${category}`, {
      headers: {
        'Authorization': token?.startsWith("Bearer ") ? token : `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch max control number");
        return res.json();
      })
      .then((data) => {
        setMaxControlNumber(typeof data === "number" ? data : 100);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching max control number:", error);
        setMaxControlNumber(100);
        setIsLoading(false);
      });
  }, [user?.organizationId, category]);

  return { maxControlNumber, isLoading };
}; 