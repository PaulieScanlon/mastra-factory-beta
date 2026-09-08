import { useState } from "react";
import { Form } from "react-router";

type ListenEditFormProps = {
  listenId: number;
  initialRating: number | null;
  initialNotes: string | null;
  onDone: () => void;
};

export const ListenEditForm = ({
  listenId,
  initialRating,
  initialNotes,
  onDone
}: ListenEditFormProps) => {
  const [rating, setRating] = useState<number | null>(initialRating);

  return (
    <Form
      method="post"
      onSubmit={onDone}
      className="flex-1 flex items-center gap-4 flex-wrap"
    >
      <input type="hidden" name="intent" value="edit-listen" />
      <input type="hidden" name="listenId" value={listenId} />
      <input type="hidden" name="rating" value={rating ?? ""} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          return (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              className={`text-2xl transition ${
                rating !== null && n <= rating
                  ? "text-yellow-300"
                  : "text-white/20 hover:text-white/50"
              }`}
            >
              ★
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setRating(null)}
          className="ml-2 text-xs uppercase tracking-widest text-white/40 hover:text-white transition"
        >
          Clear
        </button>
      </div>
      <input
        type="text"
        name="notes"
        defaultValue={initialNotes ?? ""}
        placeholder="How did it hit?"
        className="flex-1 min-w-40 px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-white/25"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="px-4 py-1.5 rounded-full text-sm text-black bg-white hover:bg-white/90 transition"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-1.5 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/5 transition"
        >
          Cancel
        </button>
      </div>
    </Form>
  );
};
