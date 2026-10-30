import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import AdminPage from "@/pages/AdminPage";
import AssessmentPage from "@/pages/AssessmentPage";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import ReportPage from "@/pages/ReportPage";
import ResultPage from "@/pages/ResultPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/app" component={Dashboard} />
      <Route path="/diagnostico" component={AssessmentPage} />
      <Route path="/resultado/:id" component={ResultPage} />
      <Route path="/relatorio/:id" component={ReportPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Toaster />
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
