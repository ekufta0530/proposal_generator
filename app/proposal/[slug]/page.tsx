"use client";

import { useEffect, useState } from "react";
import { loaders, metadata } from "@/components/sections/registry";
import { deepMerge } from "@/lib/merge";

type ProposalDoc = {
  sections: Array<{
    type: string;
    variant: string;
    enabled?: boolean;
    props?: Record<string, any>;
  }>;
};

interface Props {
  params: { slug: string };
}

export default function ProposalPage({ params }: Props) {
  const { slug } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProposalDoc | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        // Single public endpoint: server resolves tenant internally
        const res = await fetch(`/api/proposal/live?slug=${encodeURIComponent(slug)}`, {
          signal: ac.signal,
        });
        const json = await res.json();
        if (!res.ok || !json?.success || !json?.proposal?.data) {
          throw new Error(json?.error || "Failed to load proposal");
        }

        const doc = json.proposal.data as ProposalDoc;
        if (!doc || !Array.isArray(doc.sections)) {
          throw new Error("Malformed proposal document");
        }

        setProposal(doc);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError(e.message || "Failed to load proposal");
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => ac.abort();
  }, [slug]);

  if (isLoading) {
    return <Centered note="Loading proposal..." />;
  }
  if (error) {
    return <Centered error>❌ {error}</Centered>;
  }
  if (!proposal) {
    return <Centered error>Missing proposal data</Centered>;
  }

  const sections = proposal.sections.filter((s) => s?.enabled !== false);

  return (
    <main>
      <Sections sections={sections} />
    </main>
  );
}

function Sections({ sections }: { sections: ProposalDoc["sections"] }) {
  const [nodes, setNodes] = useState<React.ReactNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function build() {
      // Render directly from section.props; optionally merge with registry defaults
      const comps = await Promise.all(
        sections.map(async (s, i) => {
          const { type, variant } = s;
          const baseProps = s.props || {};

          const sectionMeta = (metadata as any)[type];
          const variantMeta = sectionMeta?.variants?.find((v: any) => v.id === variant);
          const defaults = variantMeta?.defaults || {};

          const finalProps = deepMerge(defaults, baseProps);

          const loader = loaders[type]?.[variant];
          if (!loader) {
            return (
              <div key={`${type}-${variant}-${i}`} style={{ color: "red", padding: 12 }}>
                Missing {type}.{variant}
              </div>
            );
          }
          const Section = (await loader()).default;
          return (
            <div key={`${type}-${variant}-${i}`}>
              <Section {...finalProps} />
            </div>
          );
        })
      );

      if (!cancelled) {
        setNodes(comps);
        setLoading(false);
      }
    }

    setLoading(true);
    build();
    return () => {
      cancelled = true;
    };
  }, [sections]);

  if (loading) return <Centered note="Loading sections..." />;
  return <>{nodes}</>;
}

function Centered({
  note,
  children,
  error = false,
}: {
  note?: string;
  children?: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        color: error ? "#ef4444" : "#6b7280",
        textAlign: "center",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {note ?? children}
    </div>
  );
}
