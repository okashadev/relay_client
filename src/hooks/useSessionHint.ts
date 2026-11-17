"use client";

import { useEffect, useState } from "react";

export function useSessionHint() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(document.cookie.split("; ").some((c) => c.startsWith("relay_session=")));
  }, []);

  return signedIn;
}