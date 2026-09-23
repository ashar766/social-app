"use client";

export default function EventDemo() {
  function handleParentCapture() {
    console.log("Parent - Capturing");
  }

  function handleChildClick() {
    console.log("Child - Click");
  }

  return (
    <div onClickCapture={handleParentCapture} className="rounded border p-6">
      <button
        onClick={handleChildClick}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Click Me
      </button>
    </div>
  );
}
