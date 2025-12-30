import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

function Select({ ...props }) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  width,
  style,
  ...props
}) {
  const triggerStyles = {
    display: "flex",
    width: width || "fit-content",
    height: size === "sm" ? "2rem" : "auto", // h-8 or h-9
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid var(--input-border)",
    backgroundColor: "transparent",
    fontSize: "0.875rem",
    whiteSpace: "nowrap",
    boxShadow: "var(--shadow-xs)",
    transition: "color, box-shadow",
    outline: "1px solid var(--border)",
    ...style,
  };

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={className}
      style={triggerStyles}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          style={{
            width: "1rem",
            height: "1rem",
            opacity: 0.5,
            pointerEvents: "none",
            flexShrink: 0,
          }}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  style,
  ...props
}) {
  const contentStyles = {
    position: "relative",
    zIndex: 50,
    maxHeight: "var(--radix-select-content-available-height)",
    minWidth: "8rem",
    // Use React's CSSProperties for proper typing
    transformOrigin: "var(--radix-select-content-transform-origin)",
    overflowX: "hidden",
    overflowY: "auto",
    borderRadius: "0.375rem",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    ...style,
  };

  // Add position-specific styles
  if (position === "popper") {
    contentStyles.transform = `
      var(--side) === 'bottom' ? 'translateY(0.25rem)' :
      var(--side) === 'top' ? 'translateY(-0.25rem)' :
      var(--side) === 'left' ? 'translateX(-0.25rem)' :
      'translateX(0.25rem)'
    `;
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={className}
        style={contentStyles}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          style={{
            padding: "0.25rem",
            ...(position === "popper" && {
              height: "var(--radix-select-trigger-height)",
              width: "100%",
              minWidth: "var(--radix-select-trigger-width)",
              scrollMargin: "0.25rem",
            }),
          }}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, style, ...props }) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={className}
      style={{
        color: "var(--muted-foreground)",
        padding: "0.5rem",
        fontSize: "0.75rem",
        ...style,
      }}
      {...props}
    />
  );
}

function SelectItem({ className, children, style, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        cursor: "default",
        alignItems: "center",
        gap: "0.5rem",
        borderRadius: "0.125rem",
        padding: "0.375rem 2rem 0.375rem 0.5rem",
        fontSize: "0.875rem",
        outlineStyle: "none",
        userSelect: "none",
        ...style,
      }}
      className={`${
        className || ""
      } hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50`}
      {...props}
    >
      <span
        style={{
          position: "absolute",
          right: "0.5rem",
          display: "flex",
          width: "0.875rem",
          height: "0.875rem",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon style={{ width: "1rem", height: "1rem" }} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, style, ...props }) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={className}
      style={{
        pointerEvents: "none",
        margin: "0.25rem -0.25rem",
        height: "1px",
        backgroundColor: "var(--border)",
        ...style,
      }}
      {...props}
    />
  );
}

function SelectScrollUpButton({ className, style, ...props }) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={className}
      style={{
        display: "flex",
        cursor: "default",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.25rem 0",
        ...style,
      }}
      {...props}
    >
      <ChevronUpIcon style={{ width: "1rem", height: "1rem" }} />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, style, ...props }) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={className}
      style={{
        display: "flex",
        cursor: "default",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.25rem 0",
        ...style,
      }}
      {...props}
    >
      <ChevronDownIcon style={{ width: "1rem", height: "1rem" }} />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
