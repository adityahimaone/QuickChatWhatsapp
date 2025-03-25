"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { parsePhoneNumber } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";

const countries = [
  { code: "ID", name: "Indonesia", dialCode: "62", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", dialCode: "60", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", dialCode: "65", flag: "🇸🇬" },
  { code: "TH", name: "Thailand", dialCode: "66", flag: "🇹🇭" },
  { code: "PH", name: "Philippines", dialCode: "63", flag: "🇵🇭" },
  { code: "US", name: "United States", dialCode: "1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "44", flag: "🇬🇧" },
  { code: "IN", name: "India", dialCode: "91", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", dialCode: "55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dialCode: "52", flag: "🇲🇽" },
  { code: "ES", name: "Spain", dialCode: "34", flag: "🇪🇸" },
  { code: "DE", name: "Germany", dialCode: "49", flag: "🇩🇪" },
];

export default function WhatsAppForm() {
  const { data: session } = useSession();
  const [selectedCountry, setSelectedCountry] = useState("ID");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const validateAndFormatNumber = (phoneNumber: string) => {
    const country = countries.find((c) => c.code === selectedCountry);
    const parsedNumber = parsePhoneNumber(phoneNumber, country?.code as any);

    if (parsedNumber && parsedNumber.isValid()) {
      return parsedNumber.format("E.164").replace("+", "");
    }
    return null;
  };

  const openWhatsApp = (formattedNumber: string) => {
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    window.open(whatsappUrl, "_blank");
    toast.success("WhatsApp chat window opened");
  };

  const onOpenWhatsApp = async (data: any) => {
    const formattedNumber = validateAndFormatNumber(data.phoneNumber);
    if (formattedNumber) {
      setCurrentPhoneNumber(formattedNumber);
      openWhatsApp(formattedNumber);
      reset();
    } else {
      toast.error("Please enter a valid phone number");
    }
  };

  const onSaveContact = async (data: any) => {
    try {
      const formattedNumber = validateAndFormatNumber(watch("phoneNumber"));
      if (!formattedNumber) {
        toast.error("Please enter a valid phone number");
        return;
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          country: selectedCountry,
          name: data.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save contact");
      }

      openWhatsApp(formattedNumber);
      setShowSaveDialog(false);
      reset();
      toast.success("Contact saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save contact. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <form onSubmit={handleSubmit(onOpenWhatsApp)} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/3">
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <span
                        role="img"
                        aria-label="country flag"
                        className="text-xl"
                      >
                        {
                          countries.find((c) => c.code === selectedCountry)
                            ?.flag
                        }
                      </span>
                      {countries.find((c) => c.code === selectedCountry)?.name}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span
                          role="img"
                          aria-label="country flag"
                          className="text-xl"
                        >
                          {country.flag}
                        </span>
                        {country.name} (+{country.dialCode})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                {...register("phoneNumber", { required: true })}
                placeholder="Enter phone number"
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Open in WhatsApp
            </Button>
            {session && (
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Contact</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleSubmit(onSaveContact)}
                    className="space-y-4 py-4"
                  >
                    <div className="space-y-2">
                      <Input
                        {...register("name")}
                        placeholder="Enter contact name (optional)"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Save & Open WhatsApp
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
