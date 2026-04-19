import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RadioProvider } from "./contexts/RadioContext";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Home = lazy(() => import("@/pages/Home"));
const QuizSelector = lazy(() => import("@/pages/QuizSelector"));
const ResultSharePage = lazy(() => import("@/pages/ResultSharePage"));
const AdminDashboard = lazy(() =>
  import("@/components/AdminDashboard").then((module) => ({ default: module.AdminDashboard }))
);
const AdminRadio = lazy(() => import("@/pages/AdminRadio"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#06060e] text-gray-500 dark:text-gray-400">
      Carregando...
    </div>
  );
}


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={QuizSelector} />
      <Route path="/quiz/:quizId" component={Home} />
      <Route path="/resultado/:quizId/:percentage" component={ResultSharePage} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin-radio"} component={AdminRadio} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <RadioProvider>
          <TooltipProvider>
            <Toaster />
            <Suspense fallback={<RouteFallback />}>
              <Router />
            </Suspense>
          </TooltipProvider>
        </RadioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
