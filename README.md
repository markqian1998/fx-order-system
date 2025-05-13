% Setting up the document class and basic configurations
\documentclass[a4paper,11pt]{article}

% Including essential packages for formatting and layout
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\geometry{margin=1in}
\usepackage{hyperref}
\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    urlcolor=blue,
    citecolor=blue
}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{xcolor}
\usepackage{listings}

% Configuring the listings package for code blocks
\lstset{
    basicstyle=\ttfamily\small,
    breaklines=true,
    frame=single,
    numbers=none,
    keywordstyle=\color{blue},
    stringstyle=\color{red},
    commentstyle=\color{green!50!black},
    showspaces=false,
    showstringspaces=false
}

% Customizing section headings
\titleformat{\section}{\Large\bfseries}{\thesection}{1em}{}
\titleformat{\subsection}{\large\bfseries}{\thesubsection}{1em}{}
\titleformat{\subsubsection}{\normalsize\bfseries}{\thesubsubsection}{1em}{}

% Setting up fonts (using reliable Latin fonts)
\usepackage{lmodern}

% Beginning the document
\begin{document}

% Adding the title
\begin{center}
    \Huge\textbf{fx-order-system}
\end{center}

% Adding a tagline
\begin{center}
    \large\textit{A system which helps PPFGO traders place the FX orders via email in a faster way}
\end{center}

% Project description
The \texttt{fx-order-system} is a Node.js-based application designed to streamline the process of placing FX (foreign exchange) orders via email for PPFGO traders. It features a user-friendly interface, email integration, and real-time data support to enhance efficiency in order execution.

% Features section
\section{Features}
\begin{itemize}
    \item \textbf{Email-Based Order Placement}: Allows traders to submit FX orders directly through email.
    \item \textbf{Real-Time Data}: Displays spot references and recent trading data for FX pairs.
    \item \textbf{User Interface}: Simple HTML-based interface for easy order input and tracking.
    \item \textbf{Customizable Intervals}: Supports configurable data intervals for market analysis.
\end{itemize}

% Prerequisites section
\section{Prerequisites}
\begin{itemize}
    \item \textbf{Node.js}: Version 14.x or later (recommended).
    \item \textbf{npm}: Included with Node.js installation.
    \item \textbf{Internet Connection}: Required for fetching real-time FX data.
\end{itemize}

% Installation section
\section{Installation}
\begin{enumerate}
    \item Clone the repository:
    \begin{lstlisting}[language=bash]
    git clone https://github.com/markqian1998/fx-order-system.git
    \end{lstlisting}
    \item Navigate to the project directory:
    \begin{lstlisting}[language=bash]
    cd fx-order-system
    \end{lstlisting}
    \item Install the required dependencies:
    \begin{lstlisting}[language=bash]
    npm install
    \end{lstlisting}
\end{enumerate}

% Usage section
\section{Usage}
\begin{enumerate}
    \item Start the server:
    \begin{lstlisting}[language=bash]
    node server.js
    \end{lstlisting}
    \item Open a web browser and navigate to \url{http://localhost:3000} (or the port specified in \texttt{server.js}).
    \item Ensure email settings in \texttt{server.js} are configured with valid SMTP credentials before submitting orders.
    \item Use the interface to:
    \begin{itemize}
        \item Input FX order details.
        \item View spot references and historical trading data (last 3 days, updated at 30-minute intervals).
        \item Submit orders via email with a subject line like "FX Orders - YYYYMMDD".
    \end{itemize}
    \item Monitor the console for server logs or errors.
\end{enumerate}

% Project Structure section
\section{Project Structure}
\begin{itemize}
    \item \texttt{index.html}: Main HTML file providing the user interface.
    \item \texttt{server.js}: Node.js server handling order processing and data retrieval.
    \item \texttt{package.json}: Defines project dependencies and scripts.
    \item \texttt{package-lock.json}: Ensures consistent dependency installations.
    \item \texttt{assets/}: Contains supporting files (e.g., Poseidon FX Orders User Guide).
    \item \texttt{README.md}: This documentation file.
\end{itemize}

% Configuration section
\section{Configuration}
\begin{itemize}
    \item Edit \texttt{server.js} to adjust the port (default is 3000) or email settings if needed.
    \item The system fetches FX data using external APIs; ensure no rate limits are exceeded (e.g., Yahoo Finance usage).
\end{itemize}

% Contributing section
\section{Contributing}
Contributions are welcome to improve functionality or fix issues. To contribute:
\begin{enumerate}
    \item Fork the repository.
    \item Create a new branch:
    \begin{lstlisting}[language=bash]
    git checkout -b feature-branch
    \end{lstlisting}
    \item Make your changes and commit them:
    \begin{lstlisting}[language=bash]
    git commit -m "description"
    \end{lstlisting}
    \item Push to the branch:
    \begin{lstlisting}[language=bash]
    git push origin feature-branch
    \end{lstlisting}
    \item Open a pull request with a clear description of your changes.
\end{enumerate}

% License section
\section{License}
This project is licensed under the MIT License -- see the \texttt{LICENSE} file for details (create a \texttt{LICENSE} file if not present).

% Troubleshooting section
\section{Troubleshooting}
\begin{itemize}
    \item \textbf{Server Not Starting}: Ensure Node.js and npm are installed correctly. Check the console for error messages.
    \item \textbf{Data Not Loading}: Verify your internet connection and API availability. Adjust the data interval in \texttt{server.js} if needed.
    \item \textbf{Email Issues}: Configure email settings in \texttt{server.js} with valid SMTP credentials.
\end{itemize}

% Acknowledgments section
\section{Acknowledgments}
\begin{itemize}
    \item Built with inspiration from the need to optimize FX order placement for PPFGO traders.
    \item Utilizes community resources and Node.js ecosystem tools for development.
\end{itemize}

% Contact section
\section{Contact}
For questions or support, reach out via the \href{https://github.com/markqian1998/fx-order-system/issues}{GitHub Issues} page or contact the maintainer directly.

% Ending the document
\end{document}
