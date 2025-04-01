interface Window {
    paypal: {
      Buttons: (options: any) => {
        render: (element: HTMLElement | null) => void;
      };
    };
  }