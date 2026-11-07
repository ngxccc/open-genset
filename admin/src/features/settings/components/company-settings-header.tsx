export interface CompanySettingsHeaderProps {
  title: string;
  description?: string;
}

export function CompanySettingsHeader({
  title,
  description,
}: CompanySettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
