import React from "react";
import Image from "next/image";
import { Author } from "@/types/editorial";

interface AuthorBioProps {
  author: Author;
}

export function AuthorBio({ author }: AuthorBioProps) {
  const roleLabel = {
    ADMIN: "Diretoria Editorial",
    EDITOR: "Editora Cultural",
    JOURNALIST: "Repórter Especial",
  }[author.role];

  return (
    <div className="bg-ivory border border-stone p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 my-10">
      {author.avatar_url && (
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gold shrink-0 bg-stone/40">
          <Image
            src={author.avatar_url}
            alt={author.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      )}
      <div className="space-y-1.5 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-serif text-lg font-bold text-night">
            {author.name}
          </span>
          <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider bg-white px-2 py-0.5 border border-stone">
            {roleLabel}
          </span>
        </div>
        {author.bio && (
          <p className="text-xs sm:text-sm text-blue-deep font-sans leading-relaxed">
            {author.bio}
          </p>
        )}
        <p className="text-[11px] font-mono text-stone-dark pt-1">
          {author.email}
        </p>
      </div>
    </div>
  );
}
