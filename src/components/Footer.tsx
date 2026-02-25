import { motion } from "framer-motion";
import { Heart, Globe } from "lucide-react";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="border-t border-border/50 py-6"
    >
      <div className="container flex flex-col items-center justify-center gap-2 px-4 text-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-4 w-4 fill-destructive text-destructive" />
          <span>by</span>
          <span className="font-semibold text-foreground">Aryan Pandey</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-3.5 w-3.5" />
          <span>Tulaa – Compare Countries Smartly</span>
        </div>
      </div>
    </motion.footer>
  );
};
