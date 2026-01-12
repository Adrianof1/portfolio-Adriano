import { motion } from "framer-motion";

const Intro = ({ onFinish }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 3.5 }}
      onAnimationComplete={onFinish}
    >
      <motion.h1
        className="text-4xl md:text-6xl font-black text-red-600 tracking-widest mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        ADRIANO FERREIRA
      </motion.h1>

      <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-red-600"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
};

export default Intro;