"use client";
import ModeratorsView from "@/Pages/Moderators/ModeratorsView";
import PrivateLayout from "@/layouts/PrivateLayout";
export default function Page() { return <PrivateLayout><ModeratorsView isModeratorView={true} /></PrivateLayout>; }
