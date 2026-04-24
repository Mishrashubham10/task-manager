'use client';

import { useLoginMutation } from '@/redux/features/auth/authApi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading, isError }] = useLoginMutation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // ============= HANDLE INPUT ============
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========== HANDLE SUBMIT ===========
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(formData).unwrap();
      router.push("/");
    } catch (err) {
      console.log('Login Failed', err);
    }
  };

  if (isLoading) {
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Loading...</h1>
    </div>;
  }

  if (isError) {
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Something went wrong!...</h1>
    </div>;
  }

  return (
    <section className="min-h-screen w-full">
      <div className="flex flex-col gap-6 items-center justify-center h-screen">
        <div className="space-y-6 py-4 px-4 shadow border border-accent rounded w-lg">
          <h1 className="text-2xl font-semibold space-x-0.5">Login TaskFlow</h1>

          <form className="space-y-6 max-w-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="py-1.5 px-4 outline-none border-[0.2px] border-accent rounded max-w-lg bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Shu...."
                required
                className="py-1.5 px-4 outline-none border-[0.2px] border-accent rounded max-w-lg bg-transparent focus:outline-none autofill:bg-transparent"
              />
            </div>

            <button
              className={`mt-3 disabled:${isLoading} py-1.5 px-4 bg-foreground text-background font-bold text-md w-full cursor-pointer rounded shadow`}
            >
              {isLoading ? 'Loading' : 'Login'}
            </button>
            <p className="font-semibold text-sm">
              Don&lsquo;t have an account?{' '}
              <Link href="/register" className="text-lg text-blue-600">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}