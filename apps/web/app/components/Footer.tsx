export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto px-6 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Promptia. All rights reserved.
      </div>
    </footer>
  );
};
