`latest.json` records the archives built for the immutable release tag. Registry checks normally require those exact integrity values.

The first automated release, `0.1.0`, stopped at npm authentication. Its packages were later published manually with different build output. For example, the tagged Solid bundle is 5,705 bytes; the published bundle is 984 bytes and imports the shared provider implementation. Rebuilding `v0.1.0` reproduces the original recorded integrity.

`initial-publication.json` preserves the original record and separately pins the downloaded npm archives. Reconciliation applies only when the entire original record matches. It does not accept arbitrary registry values, change `v0.1.0`, or apply to subsequent versions.

Future releases must publish the recorded build. If their integrity differs, investigate the archives rather than adding a general bypass.
