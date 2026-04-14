import { useState } from "react";
import {
  Button,
  Card,
  Input,
  Textarea,
  Badge,
  Avatar,
  Modal,
  Toast,
  Spinner,
  Skeleton,
  SkeletonText,
  ProgressBar,
  Select,
} from "@/components/ui";
import Logo, { LogoMark, LogoIcon } from "@/components/shared/Logo";

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectVal, setSelectVal] = useState("");
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] p-8 transition-colors duration-150">
      <div className="max-w-[700px] mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Logo size={36} />
          <Button variant="secondary" size="sm" onClick={toggleDark}>
            {dark ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>

        {/* Logo Variants */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Logo Variants
          </h2>
          <div className="flex items-center gap-8">
            <LogoMark size={50} />
            <LogoIcon size={40} />
            <Logo size={32} showText />
          </div>
        </section>

        {/* Buttons */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Buttons
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">
              Primary SM
            </Button>
            <Button variant="primary">Primary MD</Button>
            <Button variant="primary" size="lg">
              Primary LG
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* Badges */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Badges
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="brand">Brand</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Avatars */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Avatars
          </h2>
          <div className="flex items-center gap-3">
            <Avatar size="sm" name="John Doe" />
            <Avatar size="md" name="Jane Smith" />
            <Avatar size="lg" />
            <Avatar size="xl" name="A" />
          </div>
        </section>

        {/* Inputs */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Inputs
          </h2>
          <Input label="Email" placeholder="you@example.com" />
          <Input
            label="With Error"
            placeholder="Enter value..."
            error="This field is required"
          />
          <Textarea label="Message" placeholder="Type your message..." />
        </section>

        {/* Select */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Select
          </h2>
          <Select
            label="Language"
            placeholder="Choose language..."
            value={selectVal}
            onChange={setSelectVal}
            options={[
              { value: "en", label: "English" },
              { value: "fr", label: "French" },
            ]}
          />
        </section>

        {/* Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Cards
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                Static card
              </p>
            </Card>
            <Card hover>
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                Hover card
              </p>
            </Card>
          </div>
        </section>

        {/* Progress */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Progress
          </h2>
          <ProgressBar value={35} label="Credits used" showLabel />
          <ProgressBar value={80} size="lg" />
        </section>

        {/* Skeleton */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Skeleton
          </h2>
          <Skeleton height="40px" />
          <SkeletonText lines={3} />
        </section>

        {/* Spinner */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Spinner
          </h2>
          <div className="flex items-center gap-4">
            <Spinner size={16} />
            <Spinner size={24} />
            <Spinner size={32} />
          </div>
        </section>

        {/* Toast triggers */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Toasts
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setToast({
                  type: "success",
                  message: "Video generated successfully!",
                })
              }
            >
              Success
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setToast({
                  type: "error",
                  message: "Generation failed. Please try again.",
                })
              }
            >
              Error
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setToast({ type: "warning", message: "Low credits remaining." })
              }
            >
              Warning
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setToast({
                  type: "info",
                  message: "Your video is being processed.",
                })
              }
            >
              Info
            </Button>
          </div>
          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </section>

        {/* Modal trigger */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            Modal
          </h2>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm Action"
          >
            <p className="text-[12px] text-[var(--color-text-secondary)] mb-4">
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </Modal>
        </section>
      </div>
    </div>
  );
}

export default App;
