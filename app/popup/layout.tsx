export default function PopupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0 bg-white">
        {children}
      </body>
    </html>
  );
}