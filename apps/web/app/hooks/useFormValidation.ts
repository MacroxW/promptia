import { useState, useCallback } from "react";
import { z } from "zod";

/**
 * Hook de Validación de Formularios
 * Responsabilidad: Manejar valores, errores y validación de formularios con Zod
 */

interface UseFormValidationReturn<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    setValue: (key: keyof T, value: string) => void;
    validate: (schema: z.ZodSchema<T>) => Promise<boolean>;
    resetErrors: () => void;
}

export const useFormValidation = <T extends Record<string, any>>(
    initialValues: T
): UseFormValidationReturn<T> => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    /**
     * Actualiza un valor del formulario y limpia su error
     */
    const setValue = useCallback((key: keyof T, value: string) => {
        setValues(prev => ({ ...prev, [key]: value }));

        // Limpiar error del campo cuando el usuario escribe
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    }, [errors]);

    /**
     * Valida el formulario con el schema de Zod
     * Retorna true si es válido, false si hay errores
     */
    const validate = useCallback(async (schema: z.ZodSchema<T>): Promise<boolean> => {
        try {
            setErrors({}); // Limpiar errores previos
            await schema.parseAsync(values);
            return true;
        } catch (error: any) {
            // Verificar si es un error de validación de Zod
            if (error?.issues && Array.isArray(error.issues)) {
                // Convertir errores de Zod a errores por campo
                const fieldErrors: Partial<Record<keyof T, string>> = {};
                error.issues.forEach((err: any) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof T] = err.message;
                    }
                });
                setErrors(fieldErrors);
            }
            return false;
        }
    }, [values]);

    /**
     * Limpia todos los errores
     */
    const resetErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        values,
        errors,
        setValue,
        validate,
        resetErrors
    };
};
