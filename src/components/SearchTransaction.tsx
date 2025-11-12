import React from "react";
import { useForm } from "react-hook-form";
import { TransactionData } from "@/types/general-types";

interface Prop {
  handleBlur: (
    term: string
  ) => Promise<TransactionData | null> | TransactionData | null;
}

interface FormInput {
  searchTerm: string;
}

const SearchTransaction = ({ handleBlur }: Prop) => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    defaultValues: { searchTerm: "" },
  });

  const onSubmit = async (data: FormInput) => {
    clearErrors("searchTerm");

    // Validate that it's not empty
    if (!data.searchTerm.trim()) {
      return;
    }

    if (data.searchTerm.length < 6) {
      setError("searchTerm", {
        message: `"${data.searchTerm}" is not a valid transaction or gift ID.`,
      });
      return;
    }

    try {
      const result = await handleBlur(data.searchTerm.trim());
      if (result) {
        // Assume success
        setValue("searchTerm", ""); // Clear input
      } else {
        // No result found
        setError("searchTerm", {
          message: "No transaction found for the provided ID.",
        });
      }
    } catch (err) {
      setError("searchTerm", {
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 max-w-2xl mx-4">
      {errors.searchTerm && (
        <p className="text-red-500 text-sm mt-1">{errors.searchTerm.message}</p>
      )}
      <input
        type="search"
        placeholder="Enter transaction or gift ID"
        {...register("searchTerm")}
        onBlur={handleSubmit(onSubmit)} // Trigger search when field loses focus
        className="border rounded-sm px-4 py-2 border-gray-200 shadow w-full text-black"
        disabled={isSubmitting}
      />
    </form>
  );
};

export default SearchTransaction;
