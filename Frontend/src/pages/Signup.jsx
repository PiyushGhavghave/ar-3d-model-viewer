import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [focusedField, setFocusedField] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api.signup(form.username, form.email, form.password);
      const verificationToken = data.verificationToken;
      if (!verificationToken) throw new Error("No verification token returned");
      sessionStorage.setItem("verificationToken", verificationToken);
      sessionStorage.setItem("verificationEmail", form.email);
      navigate("/verify-email");
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  };

  const isFieldFocused = (fieldName) => focusedField === fieldName || form[fieldName];


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-gray-100">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-gray-100">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-gray-300">
            Enter your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="relative">
              <Input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={onChange}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField("")}
                className="peer h-12 pt-4 pb-2 px-3 border-2 border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors dark:text-gray-100"
                placeholder=" "
                required
              />
              <Label
                htmlFor="username"
                className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                  isFieldFocused("username")
                    ? "top-1 text-xs text-blue-600 dark:text-blue-400"
                    : "top-3 text-base text-slate-500 dark:text-gray-400"
                }`}
              >
                Username
              </Label>
            </div>

            {/* Email */}
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                className="peer h-12 pt-4 pb-2 px-3 border-2 border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors dark:text-gray-100"
                placeholder=" "
                required
              />
              <Label
                htmlFor="email"
                className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                  isFieldFocused("email")
                    ? "top-1 text-xs text-blue-600 dark:text-blue-400"
                    : "top-3 text-base text-slate-500 dark:text-gray-400"
                }`}
              >
                Email
              </Label>
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                className="peer h-12 pt-4 pb-2 px-3 border-2 border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors dark:text-gray-100"
                placeholder=" "
                required
              />
              <Label
                htmlFor="password"
                className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                  isFieldFocused("password")
                    ? "top-1 text-xs text-blue-600 dark:text-blue-400"
                    : "top-3 text-base text-slate-500 dark:text-gray-400"
                }`}
              >
                Password
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Sign Up
            </Button>

            {error && (
              <p className="text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <p className="text-center text-sm text-slate-600 dark:text-gray-300">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Log in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
