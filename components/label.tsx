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

// The dispensing label: the app's signature component. Each printed line carries data-row so the
// hero can "print" it line by line with GSAP; without JavaScript it is simply there.
export function DispensingLabel({ data, className }: { data: LabelData; className?: string }) {
  return (
    <div className={cn("v-label", className)}>
      <div className="label-head" data-row="">
        <span>{data.head}</span>
        {data.when && <span>{data.when}</span>}
      </div>
      <div className={cn("label-body", !data.img && "!grid-cols-1")} data-row="">
        {data.img && (
          <div className="label-img">
            <Image src={data.img} alt="" width={72} height={72} />
          </div>
        )}
        <div className="label-id">
          {data.brand && <span className="brand">{data.brand}</span>}
          <span className="name">{data.name}</span>
          {data.meta && <span className="meta">{data.meta}</span>}
        </div>
      </div>
      <dl className="label-fields">
        {data.fields.map((f) => (
          <div className="lf" key={f.active} data-row="">
            <dt>{f.active}</dt>
            <dd>
              <span className="tnum">{f.holds}</span> {f.needs}
            </dd>
            <dd className="lf-tag">
              <span className={cn("v-tag", f.tagKind === "flag" ? "flag" : f.tagKind === "neutral" ? "" : "ok")}>{f.tag}</span>
            </dd>
          </div>
        ))}
      </dl>
      {data.direction && (
        <div className="label-dir" data-row="">
          <Icon name="i-sun-horizon" />
          <span>{data.direction}</span>
        </div>
      )}
      {data.foot && (
        <div className="label-foot" data-row="">
          <span className="who">{data.foot}</span>
          <Icon name="i-seal-check" className="ico text-ink-3" />
        </div>
      )}
    </div>
  );
}
