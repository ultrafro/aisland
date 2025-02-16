import { Asset } from "./island.model";
import { FlexCol } from "./UILibrary";

export default function Requests({
  requests,
}: {
  requests: Record<string, Asset>;
}) {
  return (
    <FlexCol className="absolute top-0 left-0 w-full h-full z-[9999]">
      <FlexCol></FlexCol>
    </FlexCol>
  );
}
