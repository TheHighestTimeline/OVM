import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import Login from "pages/login";
import ActiveCallInterface from "pages/active-call-interface";
import CallHistoryTranscripts from "pages/call-history-transcripts";
import SettingsConfiguration from "pages/settings-configuration";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/active-call-interface" element={<ActiveCallInterface />} />
        <Route path="/call-history-transcripts" element={<CallHistoryTranscripts />} />
        <Route path="/settings-configuration" element={<SettingsConfiguration />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;