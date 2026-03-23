"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RsvpEntry {
  id: string;
  name: string;
  attendance: boolean;
  guestCount: number;
  dietary: string;
  message: string;
  createdAt: string;
}

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export default function AdminPage() {
  const t = useTranslations("admin");
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);

  useEffect(() => {
    fetch("/api/rsvp")
      .then((r) => r.json())
      .then(setRsvps)
      .catch(() => {});
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then(setGuestbook)
      .catch(() => {});
  }, []);

  const totalGuests = rsvps
    .filter((r) => r.attendance)
    .reduce((sum, r) => sum + r.guestCount, 0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-3xl sm:text-4xl text-deep section-title-underline">
            {t("pageTitle")}
          </h1>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          <div className="bg-[#FAF7F0] rounded-xl p-6 text-center border border-gold/10">
            <div className="text-3xl font-serif text-gold">{rsvps.length}</div>
            <div className="text-xs text-secondary mt-1">RSVPs</div>
          </div>
          <div className="bg-[#FAF7F0] rounded-xl p-6 text-center border border-gold/10">
            <div className="text-3xl font-serif text-gold">{totalGuests}</div>
            <div className="text-xs text-secondary mt-1">
              {t("table.guests")}
            </div>
          </div>
          <div className="bg-[#FAF7F0] rounded-xl p-6 text-center border border-gold/10">
            <div className="text-3xl font-serif text-gold">
              {guestbook.length}
            </div>
            <div className="text-xs text-secondary mt-1">
              {t("guestbookTitle")}
            </div>
          </div>
        </motion.div>

        {/* RSVP Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="font-serif text-2xl text-deep mb-6">
            {t("rsvpTitle")}
          </h2>
          {rsvps.length === 0 ? (
            <p className="text-secondary text-sm bg-[#FAF7F0] rounded-xl p-8 text-center border border-gold/10">
              {t("noRsvp")}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gold/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAF7F0] text-left">
                    <th className="px-4 py-3 font-medium text-deep">
                      {t("table.name")}
                    </th>
                    <th className="px-4 py-3 font-medium text-deep">
                      {t("table.attendance")}
                    </th>
                    <th className="px-4 py-3 font-medium text-deep">
                      {t("table.guests")}
                    </th>
                    <th className="px-4 py-3 font-medium text-deep">
                      {t("table.dietary")}
                    </th>
                    <th className="px-4 py-3 font-medium text-deep">
                      {t("table.message")}
                    </th>
                    <th className="px-4 py-3 font-medium text-deep">
                      {t("table.time")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp) => (
                    <tr
                      key={rsvp.id}
                      className="border-t border-gold/10 hover:bg-[#FAF7F0]/50"
                    >
                      <td className="px-4 py-3 text-deep">{rsvp.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                            rsvp.attendance
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {rsvp.attendance ? t("table.yes") : t("table.no")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary">
                        {rsvp.guestCount}
                      </td>
                      <td className="px-4 py-3 text-secondary">
                        {rsvp.dietary || "-"}
                      </td>
                      <td className="px-4 py-3 text-secondary max-w-xs truncate">
                        {rsvp.message || "-"}
                      </td>
                      <td className="px-4 py-3 text-secondary/60 text-xs">
                        {new Date(rsvp.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Guestbook */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-serif text-2xl text-deep mb-6">
            {t("guestbookTitle")}
          </h2>
          {guestbook.length === 0 ? (
            <p className="text-secondary text-sm bg-[#FAF7F0] rounded-xl p-8 text-center border border-gold/10">
              {t("noGuestbook")}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {guestbook.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-[#FAF7F0] rounded-xl p-6 border border-gold/10"
                >
                  <p className="text-deep text-sm leading-relaxed mb-3 italic">
                    &ldquo;{entry.message}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gold text-sm font-medium">
                      {entry.name}
                    </span>
                    <span className="text-secondary/50 text-xs">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
