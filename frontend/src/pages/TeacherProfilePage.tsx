import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Clock,
  Monitor,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/cn";
import { buscarProfessor } from "@/lib/professorService.ts";
import { formatModalities, formatRating } from "@/lib/formatTeacher";
import type { Teacher } from "@/types/teacher";

const PAGE_SHELL =
  "flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-[#0a0a0a]";

const CARD =
  "card rounded-xl transition-colors duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-md dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]";

const BLOCK_TITLE = "label-mono text-paper-500 dark:text-zinc-500";

const CHIP =
  "flex items-center gap-1.5 rounded-full border border-paper-200 bg-paper-100 px-3 py-1 text-xs font-medium text-ink-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300";

const TOKEN =
  "rounded-md border border-paper-200 bg-white px-2.5 py-1.5 text-sm font-medium text-ink-800 shadow-[inset_0_1px_0_#fff,0_1px_0_var(--color-paper-200)] dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:shadow-none";

type BlockProps = {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
};

function BlockTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className={cn(BLOCK_TITLE, "flex items-center gap-2.5")}>
      <span className="h-px w-6 bg-ocre-400" />
      {children}
    </h2>
  );
}

function Block({ title, meta, children }: BlockProps) {
  return (
    <section className="px-5 py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <BlockTitle>{title}</BlockTitle>
        {meta}
      </div>
      {children}
    </section>
  );
}

type FactRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

function FactRow({ icon, label, value }: FactRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="flex items-center gap-2 whitespace-nowrap text-paper-600 dark:text-zinc-400">
        {icon}
        {label}
      </dt>
      <dd className="text-right font-medium text-ink-800 dark:text-zinc-200">
        {value}
      </dd>
    </div>
  );
}

function SubLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-paper-600 dark:text-zinc-400">
      {icon}
      {children}
    </p>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-paper-200/70 dark:bg-white/10",
        className,
      )}
    />
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="h-12 bg-paper-200/70 dark:bg-white/10" />
        <div className="px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="size-20 shrink-0 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className={cn(CARD, "flex flex-col gap-3 p-5 md:col-span-2")}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-7/12" />
        </div>
        <div className={cn(CARD, "flex flex-col gap-3 p-5 md:col-span-1")}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </>
  );
}

export function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isActive = true;
    setIsLoading(true);
    setIsError(false);
    setTeacher(null);

    buscarProfessor(id)
      .then((found) => {
        if (isActive) setTeacher(found);
      })
      .catch(() => {
        if (isActive) setIsError(true);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className={PAGE_SHELL}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <ProfileSkeleton />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (isError || !teacher) {
    return (
      <div className={PAGE_SHELL}>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <p className="text-xl font-semibold text-ink-900 dark:text-white">
            Professor não encontrado
          </p>
          <p className="text-sm text-ink-600 dark:text-zinc-400">
            O perfil que você está procurando não existe ou foi removido.
          </p>
          <Link
            to="/professores"
            className="mt-2 rounded-md border border-paper-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 shadow-[inset_0_1px_0_#fff,0_2px_0_var(--color-paper-200)] transition-[border-color,transform,box-shadow] duration-150 hover:border-paper-400 active:translate-y-0.5 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-none dark:hover:bg-white/[0.08]"
          >
            Ver todos os professores
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const modalityLabel = formatModalities(teacher.modalities);
  const weekDays = teacher.weekDays ?? [];
  const slots = teacher.availability ?? [];
  const hasWeekDays = weekDays.length > 0;
  const hasSlots = slots.length > 0;

  return (
    <div className={PAGE_SHELL}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Link
          to="/professores"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm text-ink-600 transition-colors duration-200 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ocre-500 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Voltar para professores
        </Link>

        <Reveal className="mt-5">
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="grain relative flex items-center bg-ink-800 px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <p className="label-mono relative z-1 flex items-center gap-2.5 text-paper-300/70">
                <span className="h-px w-8 bg-ocre-400" />
                Perfil do professor
              </p>
              <span className="absolute inset-x-0 bottom-0 h-px bg-ocre-400/50" />
            </div>

            <div className="px-5 py-5">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <span
                    aria-hidden="true"
                    className="flex size-20 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xl font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_0_var(--color-ink-950)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] dark:ring-1 dark:ring-white/10"
                  >
                    {teacher.initials}
                  </span>

                  <div className="flex min-w-0 flex-col items-center gap-1.5 sm:items-start">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <h1 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
                        {teacher.name}
                      </h1>
                      {teacher.verified && (
                        <span className="flex items-center gap-1 rounded-full border border-sage-600/20 bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-600 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <BadgeCheck className="size-3.5" />
                          Verificado
                        </span>
                      )}
                    </div>

                    {teacher.reviewCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <StarRating rating={teacher.rating} />
                        <span className="tnum text-sm font-semibold text-ink-900 dark:text-white">
                          {formatRating(teacher.rating)}
                        </span>
                        <span className="text-sm text-paper-400 dark:text-zinc-600">
                          ·
                        </span>
                        <span className="text-sm text-paper-600 dark:text-zinc-400">
                          {teacher.reviewCount}{" "}
                          {teacher.reviewCount === 1
                            ? "avaliação"
                            : "avaliações"}
                        </span>
                        <span className="sr-only">
                          Nota {formatRating(teacher.rating)} de 5
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-paper-600 dark:text-zinc-400">
                        Ainda sem avaliações
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                  <p className="leading-tight">
                    <span className="tnum text-2xl font-semibold text-ink-900 dark:text-white">
                      R$ {teacher.pricePerHour}
                    </span>
                    <span className="label-mono block text-paper-500 dark:text-zinc-500">
                      por hora
                    </span>
                  </p>
                  <Button
                    variant="primary"
                    fullWidth={false}
                    className="shrink-0 px-6"
                  >
                    Agendar aula
                  </Button>
                </div>
              </div>

              <ul className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <li className={CHIP}>
                  <Monitor className="size-3.5 text-paper-500 dark:text-zinc-500" />
                  {modalityLabel}
                </li>
                <li className={CHIP}>
                  <BookOpen className="size-3.5 text-paper-500 dark:text-zinc-500" />
                  <span className="tnum">{teacher.subjects.length}</span>
                  {teacher.subjects.length === 1 ? "matéria" : "matérias"}
                </li>
                {hasWeekDays && (
                  <li className={CHIP}>
                    <CalendarDays className="size-3.5 text-paper-500 dark:text-zinc-500" />
                    <span className="tnum">{weekDays.length}</span>
                    {weekDays.length === 1
                      ? "dia na semana"
                      : "dias na semana"}
                  </li>
                )}
                {hasSlots && (
                  <li className={CHIP}>
                    <Clock className="size-3.5 text-paper-500 dark:text-zinc-500" />
                    <span className="tnum">{slots.length}</span>
                    {slots.length === 1
                      ? "horário"
                      : "horários"}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Reveal delay={0.06} className="md:col-span-2">
            <div className={CARD}>
              {teacher.bio && (
                <Block title="Sobre mim">
                  <div className="flex flex-col gap-2.5">
                    {teacher.bio.split("\n\n").map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-sm leading-relaxed text-ink-700 dark:text-zinc-300"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Block>
              )}

              <Block title="Matérias">
                <ul className="flex flex-wrap gap-2">
                  {teacher.subjects.map((subject) => (
                    <li
                      key={subject}
                      className="rounded-full border border-paper-200 bg-paper-100 px-3.5 py-1 text-sm font-medium text-ink-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200"
                    >
                      {subject}
                    </li>
                  ))}
                </ul>
              </Block>

              {(hasWeekDays || hasSlots) && (
                <Block title="Disponibilidade">
                  <div className="flex flex-col gap-4">
                    {hasWeekDays && (
                      <div>
                        <SubLabel
                          icon={
                            <CalendarDays className="size-3.5 text-paper-400 dark:text-zinc-500" />
                          }
                        >
                          Dias da semana
                        </SubLabel>
                        <div className="flex flex-wrap gap-2">
                          {weekDays.map((day) => (
                            <span key={day} className={cn(TOKEN, "min-w-11 text-center font-semibold")}>
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasSlots && (
                      <div>
                        <SubLabel
                          icon={
                            <Clock className="size-3.5 text-paper-400 dark:text-zinc-500" />
                          }
                        >
                          Horários
                        </SubLabel>
                        <ul className="flex flex-wrap gap-2">
                          {slots.map((slot) => (
                            <li key={slot} className={cn(TOKEN, "tnum")}>
                              {slot}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Block>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="md:col-span-1">
            <div className={cn(CARD, "sticky top-24")}>
              <div className="px-5 py-5">
                <div className="mb-3">
                  <BlockTitle>Resumo</BlockTitle>
                </div>
                <dl className="flex flex-col gap-3">
                  <FactRow
                    icon={
                      <Monitor className="size-3.5 shrink-0 text-paper-400 dark:text-zinc-500" />
                    }
                    label="Modalidade"
                    value={modalityLabel}
                  />
                  {hasWeekDays && (
                    <FactRow
                      icon={
                        <CalendarDays className="size-3.5 shrink-0 text-paper-400 dark:text-zinc-500" />
                      }
                      label="Dias"
                      value={weekDays.join(", ")}
                    />
                  )}
                  {hasSlots && (
                    <FactRow
                      icon={
                        <Clock className="size-3.5 shrink-0 text-paper-400 dark:text-zinc-500" />
                      }
                      label="Horários"
                      value={
                        <span className="tnum">
                          {slots.length}
                        </span>
                      }
                    />
                  )}
                  <FactRow
                    icon={
                      <BadgeCheck className="size-3.5 shrink-0 text-paper-400 dark:text-zinc-500" />
                    }
                    label="Hora-aula"
                    value={
                      <span className="tnum">R$ {teacher.pricePerHour}</span>
                    }
                  />
                </dl>

                <div className="mt-5">
                  <Button variant="primary" fullWidth>
                    Agendar aula
                  </Button>
                  <p className="mt-2.5 text-center text-xs text-paper-500 dark:text-zinc-500">
                    Sem cobrança antecipada, combine direto com o professor.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
