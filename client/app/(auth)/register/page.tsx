'use client';

import Link from 'next/link';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRegisterMutation } from '@/redux/features/auth/authApi';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [register, { isLoading, isError }] = useRegisterMutation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await register(formData).unwrap();
      router.push("/login");
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">Something went wrong!...</h1>
      </div>
    );
  }

  return (
    <section className="min-h-screen w-full">
      <div className="flex flex-col gap-6 items-center justify-center h-screen">
        <div className="space-y-6 py-4 px-4 shadow border border-accent rounded w-lg">
          <h1 className="text-2xl font-semibold space-x-0.5">
            Register TaskFlow
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="flex flex-col gap-2">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="py-1.5 px-4 outline-none border-[0.2px] border-accent-foreground rounded max-w-lg bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
                className="py-1.5 px-4 outline-none border-[0.2px] border-accent rounded max-w-lg bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Shu...."
                required
                className="py-1.5 px-4 outline-none border-[0.2px] border-accent rounded max-w-lg bg-transparent focus:outline-none autofill:bg-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 py-1.5 px-4 bg-foreground text-background font-bold text-md w-full rounded shadow disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Register'}
            </button>
            <p className="font-semibold text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-lg text-blue-600">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
