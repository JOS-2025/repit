import React, { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sanitizeText, rateLimiter, validateCSPCompliance } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';

interface SecureFormProps<T extends Record<string, any>> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  defaultValues?: Partial<T>;
  rateLimitKey?: string;
  maxSubmissions?: number;
  className?: string;
}

/**
 * Secure form wrapper with built-in validation, rate limiting, and sanitization
 */
export function SecureForm<T extends Record<string, any>>({
  schema,
  onSubmit,
  children,
  defaultValues,
  rateLimitKey = 'form-submission',
  maxSubmissions = 5,
  className = ''
}: SecureFormProps<T>) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<number>(0);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  // CSP compliance check on mount
  useEffect(() => {
    const formElement = document.querySelector('form');
    if (formElement && !validateCSPCompliance(formElement)) {
      console.warn('[Security] Form may violate CSP policies');
    }
  }, []);

  const handleSubmit = async (data: T) => {
    // Rate limiting check
    if (!rateLimiter.isAllowed(rateLimitKey, maxSubmissions)) {
      toast({
        title: "Too Many Attempts",
        description: "Please wait before submitting again.",
        variant: "destructive",
      });
      return;
    }

    // Prevent rapid submissions
    const now = Date.now();
    if (now - lastSubmission < 1000) {
      toast({
        title: "Slow Down",
        description: "Please wait a moment before submitting again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setLastSubmission(now);

      // Sanitize text fields in the data
      const sanitizedData = sanitizeFormData(data);

      // Additional validation
      const validated = schema.parse(sanitizedData);

      await onSubmit(validated);
      
    } catch (error) {
      console.error('[Security] Form submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)}
        className={className}
        noValidate // Use our own validation
      >
        {children({ ...form, formState: { ...form.formState, isSubmitting } })}
      </form>
    </Form>
  );
}

/**
 * Sanitize form data recursively
 */
function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };

  for (const key in sanitized) {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value) as any;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item: any) => 
        typeof item === 'string' ? sanitizeText(item) : item
      ) as any;
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeFormData(value) as any;
    }
  }

  return sanitized;
}

/**
 * Secure input validation schemas
 */
export const secureSchemas = {
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(100, "Email too long"),
    
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
    
  phone: z.string()
    .min(1, "Phone number is required")
    .max(20, "Phone number too long")
    .regex(/^[\+]?[1-9][\d\s\-\(\)]{7,18}$/, "Invalid phone number format"),
    
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
    
  text: z.string()
    .max(1000, "Text too long"),
    
  price: z.number()
    .min(0, "Price cannot be negative")
    .max(999999, "Price too high"),
    
  quantity: z.number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(10000, "Quantity too high"),
};