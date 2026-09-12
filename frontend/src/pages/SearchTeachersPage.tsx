import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FilterPanel } from "@/components/search/FilterPanel";
import { TeacherResultCard } from "@/components/search/TeacherResultCard";
import { TeacherSearchBar } from "@/components/search/TeacherSearchBar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Reveal } from "@/components/motion/Reveal";
import { listarProfessores } from "@/lib/teacherService";
import type { ModalityOption, Teacher } from "@/types/teacher";

type SortOption = "relevancia" | "menor-preco" | "maior-avaliacao";

type ResultsMessageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

function ResultsMessage({ title, description, children }: ResultsMessageProps) {
  return (
    <div className="inset-well flex flex-col items-start gap-2 rounded-lg p-10">
      <p className="text-lg font-semibold text-ink-900">{title}</p>
      <p className="text-sm text-ink-600">{description}</p>
      {children}
    </div>
  );
}

const FALLBACK_PRICE_RANGE: [number, number] = [0, 200];

export function SearchTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [modality, setModality] = useState<ModalityOption>("online");
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevancia");

  useEffect(() => {
    let isActive = true;

    listarProfessores()
      .then((list) => {
        if (isActive) setTeachers(list);
      })
      .catch(() => {
        if (isActive) setLoadError("Não foi possível carregar os professores.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const subjectOptions = useMemo(
    () => [...new Set(teachers.flatMap((teacher) => teacher.subjects))].sort(),
    [teachers],
  );

  const priceBounds = useMemo<[number, number]>(() => {
    if (teachers.length === 0) return FALLBACK_PRICE_RANGE;
    const prices = teachers.map((teacher) => teacher.pricePerHour);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [teachers]);

  const activePriceRange = priceRange ?? priceBounds;

  function toggleSubject(subject: string) {
    setSelectedSubjects((previous) =>
      previous.includes(subject)
        ? previous.filter((item) => item !== subject)
        : [...previous, subject],
    );
  }

  function clearFilters() {
    setSelectedSubjects([]);
    setModality("online");
    setPriceRange(null);
    setOnlyVerified(false);
  }

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matches = teachers.filter((teacher) => {
      const matchesQuery =
        query.length === 0 ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.subjects.some((subject) =>
          subject.toLowerCase().includes(query),
        );

      const matchesSubjects =
        selectedSubjects.length === 0 ||
        teacher.subjects.some((subject) => selectedSubjects.includes(subject));

      const matchesModality = teacher.modalities.includes(modality);

      const matchesPrice =
        teacher.pricePerHour >= activePriceRange[0] &&
        teacher.pricePerHour <= activePriceRange[1];

      const matchesVerified = !onlyVerified || teacher.verified;

      return (
        matchesQuery &&
        matchesSubjects &&
        matchesModality &&
        matchesPrice &&
        matchesVerified
      );
    });

    if (sortOption === "menor-preco") {
      return [...matches].sort((a, b) => a.pricePerHour - b.pricePerHour);
    }
    if (sortOption === "maior-avaliacao") {
      return [...matches].sort((a, b) => b.rating - a.rating);
    }
    return matches;
  }, [
    teachers,
    searchQuery,
    selectedSubjects,
    modality,
    activePriceRange,
    onlyVerified,
    sortOption,
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-paper-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <p className="label-mono flex items-center gap-2.5 text-paper-600">
          <span className="h-px w-8 bg-ocre-400" />
          Diretório
        </p>
        <h1 className="mt-3 mb-6 text-3xl font-semibold tracking-tight text-ink-900">
          Professores particulares
        </h1>

        <TeacherSearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[264px_1fr]">
          <FilterPanel
            subjectOptions={subjectOptions}
            minPrice={priceBounds[0]}
            maxPrice={priceBounds[1]}
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            modality={modality}
            onModalityChange={setModality}
            priceRange={activePriceRange}
            onPriceRangeChange={setPriceRange}
            onlyVerified={onlyVerified}
            onOnlyVerifiedChange={setOnlyVerified}
            onClear={clearFilters}
          />

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-200 pb-3">
              <p className="text-sm text-ink-700">
                <span className="tnum font-semibold text-ink-900">
                  {filteredTeachers.length}
                </span>{" "}
                {filteredTeachers.length === 1
                  ? "professor encontrado"
                  : "professores encontrados"}
              </p>

              <label className="flex items-center gap-2 text-sm text-paper-600">
                Ordenar por
                <select
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(event.target.value as SortOption)
                  }
                  className="rounded-md border border-paper-300 bg-white px-2.5 py-1.5 text-sm text-ink-800 shadow-[inset_0_1px_0_#fff,0_1px_0_var(--color-paper-200)] outline-none transition-colors hover:border-paper-400 focus:border-ocre-400"
                >
                  <option value="relevancia">Relevância</option>
                  <option value="menor-preco">Menor preço</option>
                  <option value="maior-avaliacao">Maior avaliação</option>
                </select>
              </label>
            </div>

            {isLoading ? (
              <div className="inset-well flex items-center gap-2 rounded-lg p-10 text-sm text-paper-600">
                <Loader2 className="size-4 animate-spin" />
                Carregando professores…
              </div>
            ) : loadError ? (
              <ResultsMessage
                title={loadError}
                description="Verifique sua conexão e tente novamente em instantes."
              />
            ) : teachers.length === 0 ? (
              <ResultsMessage
                title="Nenhum professor cadastrado ainda."
                description="Assim que um professor configurar o perfil, ele aparece aqui."
              />
            ) : filteredTeachers.length === 0 ? (
              <ResultsMessage
                title="Nenhum professor corresponde a esses filtros."
                description="Tente ampliar a faixa de valor ou remover uma matéria."
              >
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 rounded-md border border-paper-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-[inset_0_1px_0_#fff,0_2px_0_var(--color-paper-200)] transition-transform duration-150 active:translate-y-0.5 active:shadow-none"
                >
                  Limpar filtros
                </button>
              </ResultsMessage>
            ) : (
              <ul className="flex flex-col gap-4">
                {filteredTeachers.map((teacher, index) => (
                  <Reveal key={teacher.id} delay={Math.min(index, 5) * 0.05}>
                    <li>
                      <TeacherResultCard teacher={teacher} />
                    </li>
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
