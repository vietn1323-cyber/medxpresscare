import React from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {this.props.title || 'Đã xảy ra lỗi hiển thị'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {this.props.message || 'Không thể tải chi tiết sản phẩm này. Vui lòng đóng cửa sổ và thử lại sau.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
