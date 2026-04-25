import { TrackingMap } from "../../features/tracking/components/TrackingMap";
import { TrackingSidebar } from "../../features/tracking/components/TrackingSidebar";
import { useTracking } from "../../features/tracking/hooks/useTracking";

export default function Tracking() {
  const { units, selected, setSelected } = useTracking();

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", width: "100%" }}>
      <TrackingSidebar units={units} selected={selected} setSelected={setSelected} />
      <TrackingMap units={units} selected={selected} setSelected={setSelected} />
    </div>
  );
}

