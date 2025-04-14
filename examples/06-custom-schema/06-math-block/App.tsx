import React, { useState, useRef, useEffect } from "react";
import { BlockNoteSchema, defaultInlineContentSpecs,
  InlineContentFromConfig,
  PartialCustomInlineContentFromConfig,
  CustomInlineContentConfig, } from "@blocknote/core";
import { useCreateBlockNote,
  createReactInlineContentSpec,
  useComponentsContext } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/ariakit";
import katex from "katex";
import { TbMathFunction } from "react-icons/tb";

const MathBlockSchema = {
  type: "math",
  propSchema: {
    rawContent: {
      default: "a_b = c",
    },
  },
  content: "none",
} as const satisfies CustomInlineContentConfig;

const MathBlockComponent: React.FC<{
  inlineContent: InlineContentFromConfig<typeof MathBlockSchema, any>;
  updateInlineContent: (
    update: PartialCustomInlineContentFromConfig<typeof MathBlockSchema, any>
  ) => void;
}> = (props) => {
  const Components = useComponentsContext()!;
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    props.inlineContent.props.rawContent
  );
  const renderedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    katex.render(props.inlineContent.props.rawContent, renderedRef.current!, {
      output: "mathml",
      throwOnError: false,
    });
  }, [props]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = () => {
    props.updateInlineContent({
      type: MathBlockSchema.type,
      props: { rawContent: inputValue },
    });
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "click") {
      setIsOpen(false);
    }
  };

  const handleRawContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <Components.Generic.Popover.Root opened={isOpen} position="bottom">
      <Components.Generic.Popover.Trigger>
        <span ref={renderedRef} onClick={handleClick} />
      </Components.Generic.Popover.Trigger>
      <Components.Generic.Popover.Content variant="form-popover">
        <Components.Generic.Form.Root>
          <Components.Generic.Form.TextInput
            className={"bn-text-input"}
            name="rawContent"
            icon={<TbMathFunction />}
            autoFocus={true}
            placeholder="Enter your TeX code here"
            value={inputValue}
            onKeyDown={handleKeyDown}
            onChange={handleRawContentChange}
            onSubmit={handleSubmit}
          />
        </Components.Generic.Form.Root>
      </Components.Generic.Popover.Content>
    </Components.Generic.Popover.Root>
  );
};

const MathBlock = createReactInlineContentSpec(MathBlockSchema, {
  render: MathBlockComponent,
});

const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    math: MathBlock,
  },
});

export default function App() {
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: "paragraph",
        content: "Welcome to this demo!",
      },
      {
        type: "paragraph",
        content: [
          "You can add a math block by typing /math and pressing enter.",
          {
            type: "math",
            props: {
              rawContent: "a_b = c",
            },
          },
        ],
      },
    ],
  });

  return <BlockNoteView editor={editor} />;
}
