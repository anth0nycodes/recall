import { SVGProps } from "react";

type RecallIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export function RecallIcon({ size = 32, ...props }: RecallIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        width="32"
        height="32"
        rx="7.5"
        fill="url(#paint0_linear_171_171)"
      />
      <g filter="url(#filter0_i_171_171)">
        <path
          d="M17.0374 4.25H14.8763C14.6798 4.33499 14.3893 4.28687 14.1753 4.29991C13.6979 4.32869 13.2183 4.37861 12.7436 4.43437C11.2624 4.60839 9.55626 4.92181 8.23907 5.62734C7.42173 6.06532 6.42021 6.76142 6.98603 7.79431C7.15325 8.09919 7.47808 8.33706 7.76305 8.52548C8.5497 9.0453 9.47837 9.33264 10.3883 9.56107C12.6057 10.1182 14.9487 10.2545 17.2349 10.1443C18.5447 10.0813 19.8683 9.95858 21.1424 9.6528C22.0803 9.42707 22.9938 9.16446 23.8446 8.70804C24.2377 8.49715 24.7082 8.19317 24.9259 7.79251C25.4875 6.75782 24.4906 6.06667 23.6746 5.62869C22.3538 4.92046 20.6554 4.61154 19.1706 4.43482C18.6955 4.37816 18.2153 4.32914 17.7375 4.29991C17.5253 4.28732 17.2312 4.33679 17.0374 4.25Z"
          fill="white"
        />
      </g>
      <g filter="url(#filter1_i_171_171)">
        <path
          d="M14.8773 21.7179H16.8671C17.0341 21.6397 17.2696 21.6781 17.4517 21.6629C17.8852 21.6259 18.3233 21.5939 18.7532 21.5283C20.3679 21.2826 21.9866 20.8908 23.4123 20.0646C24.0736 19.6811 24.8019 19.1274 25.0785 18.3775C25.3263 17.7063 25.225 16.925 25.225 16.2167C25.225 15.5298 25.3747 14.4408 24.9416 13.8663C24.7627 14.0055 24.6157 14.309 24.4368 14.482C24.095 14.8123 23.6962 15.0959 23.2831 15.3258C22.0122 16.0326 20.5833 16.4055 19.1589 16.6419C16.9164 17.0142 14.567 17.0087 12.3303 16.5974C10.9913 16.3518 9.65964 15.9914 8.46076 15.3267C8.04775 15.0977 7.64888 14.8132 7.30706 14.4838C7.11949 14.303 6.99627 14.0259 6.80369 13.8654C6.38702 14.352 6.52028 15.6385 6.52028 16.2602C6.52028 16.9555 6.42307 17.7179 6.66677 18.3775C6.94425 19.1297 7.67079 19.6788 8.33298 20.0651C9.75274 20.8926 11.3811 21.2872 12.992 21.5287C13.4224 21.5935 13.8601 21.6259 14.2936 21.6629C14.4761 21.6786 14.7089 21.6407 14.8773 21.7179Z"
          fill="white"
        />
      </g>
      <g filter="url(#filter2_i_171_171)">
        <path
          d="M16.8543 27.5615H14.8898C14.8816 27.5615 14.8734 27.5597 14.8658 27.5565C14.6985 27.4868 14.472 27.5223 14.2936 27.5071C13.8601 27.4705 13.4224 27.4384 12.992 27.3744C12.2591 27.2657 11.5225 27.1257 10.8036 26.9283C10.8036 26.9283 10.0235 27.4529 9.86024 27.5071C9.73224 27.5495 8.9446 27.7102 8.61043 27.7777C8.55823 27.7882 8.52055 27.7281 8.55207 27.6852C8.67132 27.5229 8.8748 27.2374 8.95922 27.0681C9.08218 26.8215 9.11798 26.3285 9.11798 26.3285C8.85044 26.2073 8.58833 26.074 8.33298 25.9267C7.67079 25.5447 6.94425 25.0016 6.66677 24.2577C6.42307 23.6052 6.52028 22.8512 6.52028 22.1636C6.52028 21.5666 6.39469 20.35 6.76859 19.839C6.78713 19.8137 6.82313 19.8107 6.84581 19.8324C7.01508 19.9942 7.13353 20.2411 7.30706 20.4066C7.64888 20.7324 8.04775 21.0138 8.46076 21.2403C9.65964 21.8977 10.9913 22.2541 12.3303 22.4971C14.567 22.9038 16.9164 22.9093 19.1589 22.541C20.5833 22.3072 22.0122 21.9385 23.2831 21.2393C23.6962 21.012 24.095 20.7315 24.4368 20.4048C24.6008 20.248 24.738 19.9827 24.8975 19.8335C24.9209 19.8116 24.9575 19.8165 24.9754 19.843C25.3667 20.422 25.225 21.4595 25.225 22.1205C25.225 22.821 25.3263 23.5938 25.0785 24.2577C24.8019 24.9993 24.0736 25.547 23.4123 25.9263C21.9866 26.7434 20.3679 27.131 18.7532 27.3739C18.3233 27.4389 17.8852 27.4705 17.4517 27.5071C17.2738 27.5218 17.0449 27.4859 16.8787 27.5563C16.871 27.5596 16.8627 27.5615 16.8543 27.5615Z"
          fill="white"
        />
      </g>
      <g filter="url(#filter3_i_171_171)">
        <path
          d="M14.8773 15.9487H16.8671C17.0341 15.8738 17.2696 15.9106 17.4517 15.8959C17.8852 15.8604 18.3233 15.8298 18.7532 15.7668C20.3679 15.5312 21.9866 15.1554 23.4123 14.3629C24.0736 13.9951 24.8019 13.4639 25.0785 12.7447C25.3263 12.1008 25.225 11.3514 25.225 10.6721C25.225 10.0132 25.3747 8.96867 24.9416 8.41757C24.7627 8.55113 24.6157 8.84221 24.4368 9.00816C24.095 9.32497 23.6962 9.59697 23.2831 9.81749C22.0122 10.4955 20.5833 10.8531 19.1589 11.0799C16.9164 11.4371 14.567 11.4317 12.3303 11.0373C10.9913 10.8017 9.65964 10.456 8.46076 9.81838C8.04775 9.59874 7.64888 9.32586 7.30706 9.00993C7.11949 8.83644 6.99627 8.57066 6.80369 8.41669C6.38702 8.88347 6.52028 10.1174 6.52028 10.7138C6.52028 11.3807 6.42307 12.1119 6.66677 12.7447C6.94425 13.4662 7.67079 13.9928 8.33298 14.3633C9.75274 15.1572 11.3811 15.5356 12.992 15.7673C13.4224 15.8294 13.8601 15.8604 14.2936 15.8959C14.4761 15.911 14.7089 15.8746 14.8773 15.9487Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_171_171"
          x="6.82056"
          y="3.81064"
          width="18.7086"
          height="6.36881"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.439362" dy="-0.439362" />
          <feGaussianBlur stdDeviation="0.329521" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_171_171"
          />
        </filter>
        <filter
          id="filter1_i_171_171"
          x="6.5"
          y="13.426"
          width="19.1894"
          height="8.2919"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.439362" dy="-0.439362" />
          <feGaussianBlur stdDeviation="0.329521" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_171_171"
          />
        </filter>
        <filter
          id="filter2_i_171_171"
          x="6.5"
          y="19.3785"
          width="19.1894"
          height="8.40042"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.439362" dy="-0.439362" />
          <feGaussianBlur stdDeviation="0.329521" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_171_171"
          />
        </filter>
        <filter
          id="filter3_i_171_171"
          x="6.5"
          y="7.97733"
          width="19.1894"
          height="7.97147"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.439362" dy="-0.439362" />
          <feGaussianBlur stdDeviation="0.329521" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_171_171"
          />
        </filter>
        <linearGradient
          id="paint0_linear_171_171"
          x1="3.94444e-07"
          y1="0.875"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--primary-gradient-from)" />
          <stop offset="0.5" stopColor="var(--primary-gradient-via)" />
          <stop offset="1" stopColor="var(--primary-gradient-to)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
