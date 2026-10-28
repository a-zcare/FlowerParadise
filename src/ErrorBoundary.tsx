import { Component, type ReactNode } from "react";
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const lang = document.documentElement.lang;
    return (
      <div className="page empty">
        <h1>Flower Paradise</h1>
        <h2>
          {lang === "lv"
            ? "Kaut kas nogāja greizi."
            : lang === "ru"
              ? "Что-то пошло не так."
              : "Something went a little off-script."}
        </h2>
        <p>
          {lang === "lv"
            ? "Pārlādē lapu, lai mēģinātu vēlreiz."
            : lang === "ru"
              ? "Перезагрузите страницу, чтобы повторить попытку."
              : "Reload the page to try again."}
        </p>
        <button className="btn" onClick={() => window.location.reload()}>
          {lang === "lv"
            ? "Pārlādēt"
            : lang === "ru"
              ? "Перезагрузить"
              : "Reload"}
        </button>
      </div>
    );
  }
}
