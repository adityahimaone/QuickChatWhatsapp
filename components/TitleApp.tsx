"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import React from "react";

const TitleApp = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <MessageCircle className="w-8 h-8 text-green-500" />
        </motion.div>
        <h1 className="text-4xl font-bold">Quick Chat Whatsapp</h1>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Format and send WhatsApp messages with ease
      </p>
    </motion.div>
  );
};

export default TitleApp;
