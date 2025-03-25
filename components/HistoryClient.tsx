"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowDownUp, Trash, Edit, Send } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string | null;
  phone_number: string;
  country_code: string;
  created_at: string;
  user_email: string;
}

interface Country {
  code: string;
  flag: string;
}

interface HistoryClientProps {
  messages: Message[];
  countries: Country[];
}

export default function HistoryClient({
  messages: initialMessages,
  countries,
}: HistoryClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Message>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const supabase = createClientComponentClient();

  // Filter and sort messages
  const filteredAndSortedMessages = useMemo(() => {
    return messages
      .filter((message) => {
        const matchesSearch =
          !searchTerm ||
          message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.phone_number.includes(searchTerm);

        const matchesCountry =
          countryFilter === "all" || message.country_code === countryFilter;

        return matchesSearch && matchesCountry;
      })
      .sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        // Handle null values
        if (valueA === null) valueA = "";
        if (valueB === null) valueB = "";

        // Determine sort order
        const comparison =
          typeof valueA === "string"
            ? valueA.localeCompare(String(valueB))
            : Number(valueA) - Number(valueB);

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [messages, searchTerm, sortField, sortDirection, countryFilter]);

  const handleSort = (field: keyof Message) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete message");
      console.error(error);
    } else {
      setMessages(messages.filter((message) => message.id !== id));
      toast.success("Message deleted successfully");
    }
  };

  const handleUpdate = async (updatedMessage: Message) => {
    const { error } = await supabase
      .from("messages")
      .update({
        name: updatedMessage.name,
        phone_number: updatedMessage.phone_number,
        country_code: updatedMessage.country_code,
      })
      .eq("id", updatedMessage.id);

    if (error) {
      toast.error("Failed to update message");
      console.error(error);
    } else {
      setMessages(
        messages.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message
        )
      );
      setEditingMessage(null);
      setDialogOpen(false);
      toast.success("Message updated successfully");
    }
  };

  const getSortIcon = (field: keyof Message) => {
    if (sortField !== field) return null;
    return (
      <ArrowDownUp
        className={`ml-1 h-4 w-4 inline ${
          sortDirection === "asc" ? "transform rotate-180" : ""
        }`}
      />
    );
  };

  const openWhatsApp = (phoneNumber: string, countryCode: string) => {
    const formattedNumber = phoneNumber.startsWith("+")
      ? phoneNumber.substring(1)
      : phoneNumber;
    window.open(`https://wa.me/${formattedNumber}`, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="p-6 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <h1 className="text-2xl font-bold mb-4">Message History</h1>

        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Search name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="mr-2">{country.flag}</span>
                    {country.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name {getSortIcon("name")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("phone_number")}
                >
                  Phone Number {getSortIcon("phone_number")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("country_code")}
                >
                  Country {getSortIcon("country_code")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  Date {getSortIcon("created_at")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>{message.name || "-"}</TableCell>
                  <TableCell>{message.phone_number}</TableCell>
                  <TableCell>
                    <span
                      role="img"
                      aria-label="country flag"
                      className="text-xl mr-2"
                    >
                      {
                        countries.find((c) => c.code === message.country_code)
                          ?.flag
                      }
                    </span>
                    {message.country_code}
                  </TableCell>
                  <TableCell>
                    {format(new Date(message.created_at), "PPP")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          openWhatsApp(
                            message.phone_number,
                            message.country_code
                          )
                        }
                        title="Open in WhatsApp"
                      >
                        <Send className="h-4 w-4" />
                      </Button>

                      <Dialog
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                        key={message.id}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingMessage(message);
                              setDialogOpen(true);
                            }}
                            title="Edit contact"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          {editingMessage && (
                            <>
                              <DialogHeader>
                                <DialogTitle>Edit Contact</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="name" className="text-right">
                                    Name
                                  </Label>
                                  <Input
                                    id="name"
                                    value={editingMessage.name || ""}
                                    onChange={(e) =>
                                      setEditingMessage({
                                        ...editingMessage,
                                        name: e.target.value,
                                      })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="phone" className="text-right">
                                    Phone
                                  </Label>
                                  <Input
                                    id="phone"
                                    value={editingMessage.phone_number}
                                    onChange={(e) =>
                                      setEditingMessage({
                                        ...editingMessage,
                                        phone_number: e.target.value,
                                      })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="country"
                                    className="text-right"
                                  >
                                    Country
                                  </Label>
                                  <Select
                                    value={editingMessage.country_code}
                                    onValueChange={(value) =>
                                      setEditingMessage({
                                        ...editingMessage,
                                        country_code: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {countries.map((country) => (
                                        <SelectItem
                                          key={country.code}
                                          value={country.code}
                                        >
                                          <span className="mr-2">
                                            {country.flag}
                                          </span>
                                          {country.code}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingMessage(null);
                                    setDialogOpen(false);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleUpdate(editingMessage)}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            title="Delete contact"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this contact from
                              your history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-700"
                              onClick={() => handleDelete(message.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAndSortedMessages.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No messages found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
