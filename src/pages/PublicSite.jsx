import { useState } from "react";
import Header from "../components/Header";
import Landing from "./Landing";
import Booking from "./Booking";
import { BRAND } from "../brand";

export default function PublicSite() {
  const [route, setRoute] = useState("landing"); // "landing" | "booking"

  return (
    <div className="kn-app">
      <Header />
      <div className="kn-main">
        {route === "landing" && <Landing onStartBooking={() => setRoute("booking")} />}
        {route === "booking" && <Booking onBack={() => setRoute("landing")} />}
      </div>
      <div className="kn-footer">{BRAND.name} — agendamento online</div>
    </div>
  );
}
