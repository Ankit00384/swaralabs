"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type SubmitStatus = "idle" | "sending" | "success" | "error";

export function TalkToSalesDialog() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function handleSubmit() {
    if (status === "sending") return;

    setStatus("sending");
    try {
      const response = await fetch("/api/talk-to-sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          companyName,
          phoneNumber,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setCompanyName("");
      setPhoneNumber("");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 rounded-full border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Talk to sales
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[1.75rem] border-slate-200 bg-white p-7">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">
            Talk to sales
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-slate-500">
            Share your details and our team will reach out shortly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="sales-name">
              Name
            </label>
            <Input
              id="sales-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="h-11 rounded-xl border-slate-200 bg-slate-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="sales-company">
              Company name
            </label>
            <Input
              id="sales-company"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Your company"
              className="h-11 rounded-xl border-slate-200 bg-slate-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="sales-email">
              Work email
            </label>
            <Input
              id="sales-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="h-11 rounded-xl border-slate-200 bg-slate-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="sales-phone">
              Phone number
            </label>
            <Input
              id="sales-phone"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Your phone number"
              className="h-11 rounded-xl border-slate-200 bg-slate-50"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            {status === "success"
              ? "Thanks! We have your details and will reach out soon."
              : status === "error"
                ? "Something went wrong. Please try again."
                : "Your details are sent privately to our sales team."}
          </p>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={status === "sending"}
            className="h-11 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {status === "sending" ? "Sending..." : "Send details"}
            <Send className="ml-2 size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
