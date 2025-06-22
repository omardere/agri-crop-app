const controls = [
  { label: "Water Pump On", command: "WATER_ON" },
  { label: "Water Pump Off", command: "WATER_OFF" },
  { label: "Fan On", command: "FAN_ON" },
  { label: "Fan Off", command: "FAN_OFF" },
  { label: "Fertilizer On", command: "FERTILIZER_ON" },
  { label: "Fertilizer Off", command: "FERTILIZER_OFF" },
  { label: "Heater On", command: "HEATER_ON" },
  { label: "Heater Off", command: "HEATER_OFF" },
];

export default function ManualControls() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {controls.map((ctrl) => (
        <button
          key={ctrl.label}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          onClick={() => {}}
        >
          {ctrl.label}
        </button>
      ))}
    </div>
  );
}
