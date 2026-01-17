"use client";

interface CardContainerProps {
  children: React.ReactNode;
  title?: string;
}

export default function CardContainer({ children, title }: CardContainerProps) {
  return (
    <div className="w-full max-w-sm rounded-xl bg-white shadow-sm border border-gray-100 p-5">
      {title && (
        <h2 className="text-base font-medium text-gray-700 mb-4">{title}</h2>
      )}
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
