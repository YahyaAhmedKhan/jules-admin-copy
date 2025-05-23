"use client";

import { routes } from "@/lib/routes";
import { redirect } from "next/navigation";
export default function Home() {
    redirect(routes.login);
}