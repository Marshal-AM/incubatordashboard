"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // Add useSearchParams
import { useEffect, useState } from "react"; // Add useState for loading state

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { signInSchema } from "@/lib/validations/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { SearchParamsWrapper } from "@/components/SearchParamsWrapper";

type FormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params
  const { data: session, status } = useSession(); // Add status to track session loading
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const from = searchParams.get("from") || ""; // Get the "from" query parameter

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Redirect based on user type or "from" query parameter
      const redirectTo =
        from ||
        (session.user.userType === "startup"
          ? "/startup/dashboard"
          : "/service-provider/dashboard");
      router.push(redirectTo);
    }
  }, [session, status, from, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true); // Set loading state to true
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("root", {
          type: "manual",
          message:
            result.error === "No user found with this email"
              ? "No account found with this email address. Please check your email or create a new account."
              : result.error === "Invalid password"
              ? "Incorrect password. Please try again or use the forgot password option."
              : "Failed to sign in. Please try again.",
        });
        setIsLoading(false); // Reset loading state on error
        return;
      }

      // If sign-in is successful, wait for the session to update
      // The useEffect hook will handle the redirection once the session is updated
    } catch {
      setError("root", {
        type: "manual",
        message: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false); // Reset loading state on error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsWrapper />
      </Suspense>

      <div className="text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your email and password to explore more features on Cumma.
        </p>
      </div>

      {errors.root && (
        <Alert variant="destructive" className="text-left">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            {...register("email")}
            type="email"
            placeholder="Ex: weebsitestudio@gmail.com"
            className={cn(
              "h-12",
              errors.email && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            {...register("password")}
            type="password"
            placeholder="Ex: Abcd@12345"
            className={cn(
              "h-12",
              errors.password && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-sm font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me
          </label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      <LoadingButton
        type="submit"
        className="w-full h-12"
        loading={isLoading || isSubmitting} // Use isLoading or isSubmitting
      >
        Sign in <span className="ml-2">→</span>
      </LoadingButton>

      <div className="text-center text-sm">
        Not yet registered?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
        .
      </div>
    </form>
  );
}
