import React, { createContext, useContext, useState, useEffect } from "react";

interface FormStateContextType {
  getFormState: (key: string) => Record<string, any> | undefined;
  setFormState: (key: string, state: Record<string, any>) => void;
  clearFormState: (key: string) => void;
}

const FormStateContext = createContext<FormStateContextType | undefined>(
  undefined
);

export const FormStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formStates, setFormStates] = useState<Record<string, any>>(() => {
    const savedStates = sessionStorage.getItem("formStates");
    return savedStates ? JSON.parse(savedStates) : {};
  });

  useEffect(() => {
    sessionStorage.setItem("formStates", JSON.stringify(formStates));
  }, [formStates]);

  const getFormState = (key: string) => formStates[key];

  const setFormState = (key: string, state: Record<string, any>) => {
    setFormStates((prev) => ({ ...prev, [key]: state }));
  };

  const clearFormState = (key: string) => {
    setFormStates((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <FormStateContext.Provider
      value={{ getFormState, setFormState, clearFormState }}
    >
      {children}
    </FormStateContext.Provider>
  );
};

export const useFormState = () => {
  const context = useContext(FormStateContext);
  if (!context) {
    throw new Error("useFormState must be used within a FormStateProvider");
  }
  return context;
};