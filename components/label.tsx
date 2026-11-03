import Image from "next/image";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export type LabelField = { active: string; holds: string; needs: string; tag: string; tagKind?: "ok" | "flag" | "neutral" };
export type LabelData = {
  head: string;
  when?: string;
  brand?: string;
  name: string;
  meta?: string;
  img?: string;
  fields: LabelField[];
  direction?: string;
  foot?: string;
};

// The dispensing label: the app's signature component, rebuilt as a server component.
// `print` runs the line-by-line print animation once on mount (see globals.css).
export function DispensingLabel({ data, print, className }: { data: LabelData; print?: boolean; className?: string }) {
  let i = 0;
  const row = () => ({ "--i": i++ } as React.CSSProperties);
  return (
    <div className={cn("v-label", print && "print", className)}>
      <div className="label-head" style={row()}>
        <span>{data.head}</span>
        {data.when && <span className="num">{data.when}</span>}
      </div>
      <div className="label-body" style={row()}>
        <div className="label-img">
          {data.img ? <Image src={data.img} alt="" width={76} height={76} /> : null}
        </div>
        <div className="label-id">
          {data.brand && <span className="brand">{data.brand}</span>}
          <span className="name">{data.name}</span>
          {data.meta && <span className="meta">{data.meta}</span>}
        </div>
      </div>
      <dl className="label-fields">
        {data.fields.map((f) => (
          <div className="lf" key={f.active} style={row()}>
            <dt>{f.active}</dt>
            <dd>
              <span className="num">{f.holds}</span> {f.needs}
            </dd>
            <span className={cn("v-tag", f.tagKind === "flag" ? "flag" : f.tagKind === "neutral" ? "" : "ok")}>{f.tag}</span>
          </div>
        ))}
      </dl>
      {data.direction && (
        <div className="label-dir" style={row()}>
          <Icon name="i-sun-horizon" />
          <span>{data.direction}</span>
        </div>
      )}
      {data.foot && (
        <div className="label-foot" style={row()}>
          <span className="who">{data.foot}</span>
          <Icon name="i-seal-check" className="ico text-cross-ink" />
        </div>
      )}
    </div>
  );
}
