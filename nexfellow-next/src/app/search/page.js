"use client";

import SearchResults from "@/Pages/SearchResults/SearchResults";
import PrivateLayout from "@/layouts/PrivateLayout";

export default function SearchPage() {
    return (
        <PrivateLayout>
            <SearchResults />
        </PrivateLayout>
    );
}
